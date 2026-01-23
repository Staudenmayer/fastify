import session from '@fastify/session';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(session, {
			secret: process.env.SESSION_SECRET ?? '',
		});
	},
	{
		name: 'session',
		dependencies: ['cookie'],
	},
);
