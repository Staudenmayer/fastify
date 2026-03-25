import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type Account from '../types/Account.ts';
import { keycloak } from '../helpers/keycloak.ts';
import type { paths } from '../types/keycloak';
import type { FastifyRedis } from '@fastify/redis';
import type { MongoClient } from 'mongodb';
type GetUsersResponse =
	paths['/admin/realms/{realm}/users']['get']['responses']['200']['content']['application/json'];

type GetUserResponse =
	paths['/admin/realms/{realm}/users/{user-id}']['get']['responses']['200']['content']['application/json'];

dayjs.extend(utc);

export async function getSingleAccount(
	id: string,
	redis: FastifyRedis,
	mongo: MongoClient,
) {
	const cacheKey = `user:${id}`;
	const ttlSeconds = 300;

	try {
		const cachedUser = await redis.get(cacheKey);
		if (cachedUser) {
			return JSON.parse(cachedUser);
		}
		const response = await keycloak.get<GetUserResponse>(
			`/admin/realms/${process.env.KEYCLOAK_REALM}/users/${id}`,
		);
		const userCol = mongo.db('auth').collection<Account>('users');
		const existingUser = await userCol.findOneAndUpdate(
			{ _id: id },
			{
				$setOnInsert: {
					createdAt: dayjs.utc().unix(),
				},
			},
			{
				upsert: true,
				returnDocument: 'after',
			},
		);
		if (!existingUser) {
			throw new Error('This account does not exist!');
		}

		/*
		const roles = await keycloak.get(
			`/admin/realms/${process.env.KEYCLOAK_REALM}/users/${request.user.sub}/role-mappings`,
		);
		*/

		const userData = Object.assign(
			{
				id: id,
				name: response.data.username,
				firstName: response.data.firstName,
				lastName: response.data.lastName,
				email: response.data.email,
				emailVerified: response.data.emailVerified,
				enabled: response.data.enabled,
				createdTimestamp: response.data.createdTimestamp,
				totp: response.data.totp,
			},
			existingUser,
		);

		await redis.set(cacheKey, JSON.stringify(userData), 'EX', ttlSeconds);
		return userData;
	} catch {
		throw new Error('an error occurred');
	}
}

export async function getAccount(request: FastifyRequest, reply: FastifyReply) {
	const { redis, mongo } = request;

	try {
		const userData = await getSingleAccount(
			request.user.sub,
			redis,
			mongo.client,
		);
		return reply.send(userData);
	} catch (error) {
		if (error instanceof Error) {
			return reply.badRequest(error.message);
		}
		return reply.badRequest('an error occurred');
	}
}

export async function getAccountList(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const response = await keycloak.get<GetUsersResponse>(
			`/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
		);

		const accounts = response.data.map((el) => {
			return {
				id: el.id,
				name: el.username,
				firstName: el.firstName,
				lastName: el.lastName,
				email: el.email,
				emailVerified: el.emailVerified,
				enabled: el.enabled,
				createdTimestamp: el.createdTimestamp,
				totp: el.totp,
			};
		});
		const userCol = request.mongo.client
			.db('auth')
			.collection<Account>('users');
		const now = dayjs.utc().unix();

		const operations = accounts.map((account) => ({
			updateOne: {
				filter: { _id: account.id },
				update: [
					{
						$set: {
							createdAt: { $ifNull: ['$createdAt', now] },
						},
					},
				],
				upsert: true,
			},
		}));

		await userCol.bulkWrite(operations);
		const users = await userCol
			.find({
				_id: { $in: accounts.map((el) => el.id!) },
			})
			.toArray();
		const userMap = new Map(users.map((u) => [u._id, u]));

		const merged = accounts.map((account) => {
			const user = userMap.get(account.id!) || {};
			return Object.assign(
				account,
				user, // merge user fields into account
			);
		});
		return reply.send(merged);
	} catch {
		return reply.badRequest('an error occurred');
	}
}
