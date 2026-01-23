import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async function registerCookie(app: FastifyInstance) {
		await app.register(cookie, {
			secret: process.env.COOKIE_SECRET,
		});
	},
	{
		name: 'cookie',
	},
);
