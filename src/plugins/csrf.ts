import csrf from '@fastify/csrf-protection';
import type { FastifyInstance } from 'fastify';

export default async function registerCSRF(app: FastifyInstance) {
	await app.register(csrf);
}
