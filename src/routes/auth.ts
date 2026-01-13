import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
	getAccount,
	loggoutAccount,
	loginAccount,
	registerAccount,
	sendVerifyAccount,
	type VerificationCode,
	verifyAccount,
} from '../models/auth';

async function authRoutes(app: FastifyInstance) {
	app.post(
		'/register',
		{
			schema: {
				summary: 'Register new account',
				description: 'Registers a new account and sets a session cookie',
				tags: ['Authentication'],
				body: { $ref: 'registerBody#' },
				response: {
					200: { $ref: 'registerResponse200#' },
					400: { $ref: 'HttpError#' },
				},
			},
		},
		registerAccount,
	);

	app.post(
		'/login',
		{
			schema: {
				summary: 'Login to account',
				description:
					'Authenticates an account and sets the JWT token if credentials are valid.',
				tags: ['Authentication'],
				body: { $ref: 'loginBody#' },
				response: {
					200: { $ref: 'loginResponse200#' },
					401: { $ref: 'HttpError#' },
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
				security: [{ jwtCookie: [] }],
				params: { $ref: 'verifyParams#' },
				response: {
					204: { $ref: 'empty204#' },
					400: { $ref: 'HttpError#' },
					404: { $ref: 'HttpError#' },
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
				security: [{ jwtCookie: [] }],
				response: {
					204: { $ref: 'empty204#' },
					400: { $ref: 'HttpError#' },
					404: { $ref: 'HttpError#' },
				},
			},
		},
		sendVerifyAccount,
	);

	app.get(
		'/profile',
		{
			preHandler: [app.authenticate],
			schema: {
				summary: 'Get account info',
				description: 'Get account information of the currently used account.',
				tags: ['Authentication'],
				security: [{ jwtCookie: [] }],
				response: {
					200: { $ref: 'profileResponse200#' },
					401: { $ref: 'HttpError' },
					404: { $ref: 'HttpError' },
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
				summary: 'Logout of Account',
				description: 'Logout of currently used Account',
				tags: ['Authentication'],
				security: [{ jwtCookie: [] }],
				response: {
					204: { $ref: 'empty204#' },
					401: { $ref: 'HttpError#' },
				},
			},
		},
		loggoutAccount,
	);
}

export default fp(authRoutes, {
	name: 'auth-route',
});
