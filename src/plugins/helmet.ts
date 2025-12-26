import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

export default async function registerHelmet(app: FastifyInstance) {
	await app.register(helmet, {});
}
