import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';

export default async function registerCookie(app: FastifyInstance) {
	await app.register(cookie, {
		secret: process.env.COOKIE_SECRET,
	});
}
