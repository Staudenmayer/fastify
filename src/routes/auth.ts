import type { FastifyInstance } from 'fastify';
import {
	getAccount,
	loggoutAccount,
	loginAccount,
	registerAccount,
	sendVerifyAccount,
	type VerificationCode,
	verifyAccount,
} from '../models/auth';

export default async function (app: FastifyInstance) {
	app.post(
		'/register',
		{
			schema: {
				summary: 'Register new account',
				description: 'Registers a new account and sets a session cookie',
				tags: ['Authentication'],
				body: {
					type: 'object',
					required: ['username', 'email', 'password'],
					properties: {
						username: { $ref: 'username' },
						email: { $ref: 'email' },
						password: { $ref: 'password' },
					},
				},
				response: {
					200: {
						description:
							'Successful registration. Returns user ID, sets session cookie.',
						type: 'object',
						properties: {
							id: { $ref: 'userid' },
							username: { $ref: 'username' },
							email: { $ref: 'email' },
							verified: { $ref: 'userVerified' },
							verifiedAt: { $ref: 'userVerifiedAt' },
							createdAt: { $ref: 'userCreatedAt' },
						},
						required: ['id', 'username', 'email'],
					},
					400: {
						description: 'Registration failed.',
						type: 'string',
						example: 'User already exists',
					},
				},
			},
		},
		registerAccount,
	);

	/**
	 * Login route (public)
	 */
	app.post(
		'/login',
		{
			schema: {
				summary: 'Loggin to account',
				description:
					'Authenticates a account and sets the jwt token if credentials are valid.',
				tags: ['Authentication'],
				body: {
					type: 'object',
					required: ['email', 'password'],
					properties: {
						email: { $ref: 'email' },
						password: { $ref: 'password' },
					},
				},
				response: {
					200: {
						description: 'Successful login. Returns a signed JWT token.',
						type: 'object',
						properties: {
							id: { $ref: 'userid' },
							email: { $ref: 'email' },
							username: { $ref: 'username' },
							verified: { $ref: 'userVerified' },
							verifiedAt: { $ref: 'userVerifiedAt' },
							createdAt: { $ref: 'userCreatedAt' },
						},
					},
					403: {
						description:
							'Authentication failed. The provided username or password is invalid.',
						type: 'string',
						example: 'Invalid Credentials',
					},
				},
			},
		},
		loginAccount,
	);

	app.get<{ Params: VerificationCode }>(
		'/verify/:code',
		{
			preHandler: [app.authenticate],
			schema: {
				summary: 'Verify account',
				description: 'Verify account through email verification code.',
				tags: ['Authentication'],
				security: [
					{
						jwtCookie: [],
					},
				],
				params: {
					type: 'object',
					properties: {
						code: {
							type: 'string',
							description: 'Verification code',
							example: '21f9d7c6-3081-43f5-af61-68a5ae5f671f',
						},
					},
					required: ['code'],
				},
				response: {
					204: {
						description: 'Success',
					},
					400: {
						description: 'Error',
					},
					404: {
						description: 'Error',
					},
				},
			},
		},
		verifyAccount,
	);

app.post(
		'/verify',
		{
			preHandler: [app.authenticate],
			schema: {
				summary: 'Send account verification',
				description: 'Send account verification email.',
				tags: ['Authentication'],
				security: [
					{
						jwtCookie: [],
					},
				],
				response: {
					204: {
						description: 'Success',
					},
					400: {
						description: 'Error',
					},
					404: {
						description: 'Error',
					},
				},
			},
		},
		sendVerifyAccount,
	);

	/**
	 * Protected route
	 */
	app.get(
		'/profile',
		{
			preHandler: [app.authenticate],
			schema: {
				summary: 'Get account info',
				description: 'Get account information of the currently used account.',
				tags: ['Authentication'],
				security: [
					{
						jwtCookie: [],
					},
				],
				response: {
					200: {
						type: 'object',
						properties: {
							id: { $ref: 'userid' },
							username: { $ref: 'username' },
							email: { $ref: 'email' },
							verified: { $ref: 'userVerified' },
							verifiedAt: { $ref: 'userVerifiedAt' },
							createdAt: { $ref: 'userCreatedAt' },
						},
					},
				},
			},
		},
		getAccount,
	);

	app.post(
		'/logout',
		{
			preHandler: [app.authenticate],
			schema: {
				summary: 'Loggout of Account',
				description: 'Loggout of currently used Account',
				tags: ['Authentication'],
				security: [{ jwtCookie: [] }],
				response: {
					204: {
						description: 'Success',
					},
					401: {
						$ref: 'error401',
					},
				},
			},
		},
		loggoutAccount,
	);
}
