import sensible from '@fastify/sensible';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

//Docs https://github.com/fastify/fastify-sensible

export default fp(
	async (app: FastifyInstance) => {
		await app.register(sensible, {
			sharedSchemaId: 'HttpError'
		});
	},
	{
		name: 'sensible',
	},
);
