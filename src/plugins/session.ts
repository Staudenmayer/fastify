import session from '@fastify/session';
import type { FastifyInstance } from 'fastify';

export default async function registerSession(app: FastifyInstance) {
	await app.register(session, {
		secret: process.env.SESSION_SECRET || 'secret',
	});
}
