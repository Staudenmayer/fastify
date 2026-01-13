import pressure from '@fastify/under-pressure';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(pressure, {
			maxEventLoopDelay: 2000,
			maxHeapUsedBytes: 500000000, //500MB
			maxRssBytes: 800000000, //600MB
			maxEventLoopUtilization: 0.95,
		});
	},
	{
		name: 'pressure',
	},
);
