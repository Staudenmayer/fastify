import csrf from '@fastify/csrf-protection';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async function registerCSRF(app: FastifyInstance) {
	await app.register(csrf);
}, {
	name: 'csrf',
});
