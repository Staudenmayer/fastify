import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

export default async function registerCors(app: FastifyInstance) {
	await app.register(cors, {});
}
