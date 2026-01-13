import sensible from '@fastify/sensible';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

//Docs https://github.com/fastify/fastify-sensible

export default fp(
	async (app: FastifyInstance) => {
		await app.register(sensible);
		app.addSchema({
			$id: 'HttpError',
			type: 'object',
			properties: {
				statusCode: { type: 'number' },
				error: { type: 'string' },
				message: { type: 'string' },
			},
			required: ['statusCode', 'error'],
		});
	},
	{
		name: 'sensible',
	},
);
