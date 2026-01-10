import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async function registerHelmet(app: FastifyInstance) {
	await app.register(helmet, {});
}, {
	name: 'helmet',
});
