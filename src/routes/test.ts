import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function authRoutes(app: FastifyInstance) {
	app.get(
		'/test',
		{
			schema: {
				summary: 'Test',
				description: 'Get account information of the currently used account.',
				response: {
					404: { $ref: 'HttpError' },
				},
			},
		},
		(request, reply) => {
			return reply.notFound('some error happend');
		},
	);
}

export default async function (app: FastifyInstance) {
	app.register(
		fp(authRoutes, {
			name: 'test-route',
		}),
	);
}
