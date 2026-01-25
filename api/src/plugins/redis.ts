import redis from '@fastify/redis';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async function (app: FastifyInstance) {
		await app.register(redis, {
			host: '127.0.0.1',
			//password: '',
			//username: '',
			port: 6379,
		});
	},
	{
		name: 'redis',
	},
);
