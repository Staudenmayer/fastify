import rateLimiter from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

export default async function registerRateLimiter(app: FastifyInstance) {
	await app.register(rateLimiter, {
		max: 1000,
		timeWindow: '1m',
	});
}
