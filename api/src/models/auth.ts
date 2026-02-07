import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import type LoginBody from '../types/LoginBody.ts';
import type Account from '../types/Account.ts';

dayjs.extend(utc);

const saltRounds = Number.parseInt(process.env.SALT_ROUNDS || '12', 10);
const cookieName = process.env.COOKIE_NAME || 'auth-token';

export async function registerAccount(
	request: FastifyRequest<{ Body: LoginBody }>,
	reply: FastifyReply,
) {
	const { name, email, password } = request.body;
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<Account>>('users');

	const existingUser = await userCol.findOne({ email });
	if (existingUser) {
		return reply.badRequest('Account already exists');
	}

	const hashedPassword = await bcrypt.hash(password, saltRounds);
	const id = uuidv4();
	const now = dayjs.utc();
	const createdAt = now.toDate();

	const result = await userCol.insertOne({
		_id: id,
		name,
		email,
		password: hashedPassword,
		createdAt: createdAt,
	});

	const userId = result.insertedId.toString();
	const token = await reply.jwtSign({ id: userId, name, email });

	return reply
		.setCookie(cookieName, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		})
		.send({
			id: userId,
			name,
			email,
			createdAt,
		});
}

export async function loginAccount(
	request: FastifyRequest<{ Body: LoginBody }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;

	const users = request.mongo.client.db('auth').collection<Account>('users');
	const user = await users.findOne({ email });

	if (
		!user ||
		!(await bcrypt.compare(password, user.password)) ||
		user.email !== email
	) {
		return reply.unauthorized('Invalid credentials');
	}
	const token = await reply.jwtSign({
		id: user._id.toString(),
		email: email,
		name: user.name,
	});

	return reply
		.setCookie(cookieName, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})
		.send({
			id: user._id.toString(),
			name: user.name,
			email,
			createdAt: user.createdAt,
		});
}

export async function getAccount(request: FastifyRequest, reply: FastifyReply) {
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<Account>>('users');
	const existingUser = await userCol.findOne({ _id: request.user.id });
	if (!existingUser) {
		return reply.notFound('This account does not exist!');
	}

	//request.logger.info('Test')
	return reply.send({
		id: request.user.id,
		name: request.user.name,
		email: request.user.email,
		createdAt: existingUser.createdAt,
	});
}

export async function loggoutAccount(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	return reply.clearCookie(cookieName).code(204).send();
}
