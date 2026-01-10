import rateLimiter from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async(app: FastifyInstance) => {
	await app.register(rateLimiter, {
		max: 1000,
		timeWindow: '1m',
	});
}, {
	name: 'rateLimit',
});
