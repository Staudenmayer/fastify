import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		const schemas = [
			{
				$id: 'error401',
				title: '401',
				type: 'object',
				properties: {
					message: {
						title: 'Unauthorized',
						type: 'string',
						description: 'The account is not authorized to access this path.',
					},
				},
			},
		];

		for (const schema of schemas) {
			app.addSchema(schema);
		}
	},
	{
		name: 'http-schema',
	},
);
