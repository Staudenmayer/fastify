import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';

const cookieName = process.env.COOKIE_NAME || 'auth-token';

export default async function registerJWT(app: FastifyInstance) {
	await app.register(jwt, {
		secret: process.env.JWT_SECRET || 'secret',
		cookie: {
			cookieName: cookieName,
			signed: true,
		},
	});
}
