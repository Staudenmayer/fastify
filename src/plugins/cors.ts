import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async function registerCors(app: FastifyInstance) {
	await app.register(cors, {});
}, {
	name: 'cors',
});
