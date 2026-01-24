import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function authRoutes(app: FastifyInstance) {
	app.get(
		'/test',
		{
			schema: {
				summary: 'Test',
				description: 'Registers a new account and sets a session cookie',
				response: {
					200: {
						type: 'object',
						title: 'Account Base',
						description: 'Base account information.',
						properties: {
							id: {
								type: 'string',
								description: 'test sdaf lasdjfl ',
							},
						},
					},
					400: { $ref: 'HttpError#' },
				},
			},
		},
		(_request, reply) => {
			reply.send({ id: 'asd' });
		},
	);
}

export default fp(authRoutes, {
	name: 'test-route',
});
