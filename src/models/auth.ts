import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { FastifyReply, FastifyRequest } from 'fastify';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { verificationTimeout } from '../defaults/auth';
import { noReply } from '../defaults/mailer';
import { minToString } from '../helpers/cron';
import { loadHTML, sendMail } from '../helpers/mailer';
import type LoginBody from '../types/LoginBody';
import type User from '../types/User';

dayjs.extend(utc);

const saltRounds = Number.parseInt(process.env.SALT_ROUNDS || '12', 10);
const cookieName = process.env.COOKIE_NAME || 'auth-token';

function sendVerificationEmail(
	email: string,
	verificationCode: string,
	host: string,
) {
	const template = loadHTML('./src/html/auth.verification.html', {
		$1: host,
		$2: verificationCode,
		$3: minToString(verificationTimeout),
	});
	sendMail({
		from: noReply, // sender address
		to: email, // list of recipients
		subject: 'Account registration', // subject line
		html: template,
	});
}

export async function registerAccount(
	request: FastifyRequest<{ Body: LoginBody }>,
	reply: FastifyReply,
) {
	const { username, email, password } = request.body;
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<User>>('users');

	const existingUser = await userCol.findOne({ email });
	if (existingUser) {
		return reply.badRequest('User already exists');
	}

	const hashedPassword = await bcrypt.hash(password, saltRounds);
	const verificationCode = uuidv4();
	const id = uuidv4();
	const now = dayjs.utc();
	const createdAt = now.toDate();

	sendVerificationEmail(email, verificationCode, request.host);
	const result = await userCol.insertOne({
		_id: id,
		username,
		email,
		password: hashedPassword,
		verificationCode: verificationCode,
		verified: false,
		verifiedAt: null,
		createdAt: createdAt,
	});

	cron.schedule(`*/${verificationTimeout} * * * *`, async () => {
		await userCol.updateOne(
			{
				_id: id,
			},
			{
				$set: {
					verificationCode: null,
				},
			},
		);
	});

	const userId = result.insertedId.toString();
	const token = await reply.jwtSign({ id: userId, username, email });

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
			username,
			email,
			verified: false,
			verifiedAt: null,
			createdAt,
		});
}

export async function loginAccount(
	request: FastifyRequest<{ Body: LoginBody }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body;

	const users = request.mongo.client.db('auth').collection<User>('users');
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
		username: user.username,
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
			username: user.username,
			email,
			verified: user.verified,
			verifiedAt: user.verifiedAt,
			createdAt: user.createdAt,
		});
}

export type VerificationCode = { code: string };

export async function verifyAccount(
	request: FastifyRequest<{ Params: VerificationCode }>,
	reply: FastifyReply,
) {
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<User>>('users');
	const existingUser = await userCol.findOne({ _id: request.user.id });
	if (!existingUser) {
		return reply.notFound('This user does not exist!');
	}
	if (existingUser.verified) {
		return reply.badRequest('This account is already verified.');
	}
	if (existingUser.verificationCode !== request.params.code) {
		return reply.badRequest('This verification code is wrong!');
	}
	await userCol.updateOne(
		{
			_id: request.user.id,
		},
		{
			$set: {
				verified: true,
				verifiedAt: dayjs.utc().toDate(),
				verificationCode: null,
			},
		},
	);
	reply.code(204).send();
}

export async function sendVerifyAccount(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<User>>('users');
	const existingUser = await userCol.findOne({ _id: request.user.id });
	if (!existingUser) {
		return reply.notFound('This user does not exist!');
	}
	if (existingUser.verified) {
		return reply.badRequest('This account is already verified.');
	}
	const verificationCode = uuidv4();
	await userCol.updateOne(
		{
			_id: request.user.id,
		},
		{
			$set: {
				createdAt: dayjs.utc().toDate(),
				verifiedAt: null,
				verificationCode: verificationCode,
			},
		},
	);
	sendVerificationEmail(request.user.email, verificationCode, request.host);
	reply.code(204).send();
}

export async function getAccount(request: FastifyRequest, reply: FastifyReply) {
	const userCol = request.mongo.client
		.db('auth')
		.collection<Partial<User>>('users');
	const existingUser = await userCol.findOne({ _id: request.user.id });
	if (!existingUser) {
		return reply.notFound('This user does not exist!');
	}

	//request.logger.info('Test')
	return reply.send({
		id: request.user.id,
		username: request.user.username,
		email: request.user.email,
		verified: existingUser.verified,
		verifiedAt: existingUser.verifiedAt,
		createdAt: existingUser.createdAt,
	});
}

export async function loggoutAccount(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	return reply.clearCookie(cookieName).code(204).send();
}
