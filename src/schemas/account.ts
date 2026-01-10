import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		const schemas = [
			{
				$id: 'password',
				title: 'password',
				type: 'string',
				description: 'The password of the account.',
				minLength: 10,
				example: 'password123#',
			},

			{
				$id: 'email',
				title: 'email',
				type: 'string',
				format: 'email',
				description: 'The email of the account.',
				example: 'invalid@nowhere.com',
			},

			{
				$id: 'username',
				title: 'username',
				type: 'string',
				description: 'The username of the account.',
				minLength: 4,
				example: 'username',
			},

			{
				$id: 'userid',
				title: 'id',
				type: 'string',
				description: 'The accounts id.',
			},

			{
				$id: 'userVerified',
				title: 'verified',
				type: 'boolean',
				description: 'Verification state of the account.',
			},

			{
				$id: 'userVerifiedAt',
				title: 'verifiedAt',
				type: 'string',
				description: 'Verification date of the account.',
			},

			{
				$id: 'userCreatedAt',
				title: 'createdAt',
				type: 'string',
				description: 'Account creation date.',
			},
		];

		for (const schema of schemas) {
			app.addSchema(schema);
		}
	},
	{
		name: 'account-schema',
	},
);
