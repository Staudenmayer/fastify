import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { getAccount, getAccountList } from '../models/auth.ts';

async function authRoutes(app: FastifyInstance) {
	app.get(
		'/me',
		{
			preValidation: [app.authenticate],
			schema: {
				summary: 'Get account info',
				description: 'Get account information of the currently used account.',
				tags: ['Account'],
				security: [{ jwtCookie: [] }],
				response: {
					200: { $ref: 'accountResponse200#' },
					401: { $ref: 'HttpError' },
					404: { $ref: 'HttpError' },
				},
			},
		},
		getAccount,
	);

	app.get(
		'/accounts',
		{
			preValidation: [app.authenticate],
			schema: {
				summary: 'Get account list',
				description: 'Get account list information.',
				tags: ['Account'],
				security: [{ jwtCookie: [] }],
				response: {
					200: { type: 'array', items: { $ref: 'accountResponse200#' } },
					401: { $ref: 'HttpError' },
					404: { $ref: 'HttpError' },
				},
			},
		},
		getAccountList,
	);
}

export default fp(authRoutes, {
	name: 'auth-route',
});
