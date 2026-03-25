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
				$id: 'name',
				title: 'name',
				type: 'string',
				description: 'The name of the account.',
				minLength: 4,
				example: 'name',
			},

			{
				$id: 'firstName',
				title: 'firstName',
				type: 'string',
				description: 'The first name of the account holder.',
				minLength: 4,
				example: 'John',
			},

			{
				$id: 'lastName',
				title: 'lastName',
				type: 'string',
				description: 'The last name of the account holder.',
				minLength: 4,
				example: 'Doe',
			},

			{
				$id: 'accountId',
				title: 'id',
				type: 'string',
				format: 'uuid',
				description: "The account's id.",
				example: '550e8400-e29b-41d4-a716-446655440000',
			},

			{
				$id: 'accountEmailVerified',
				title: 'emailVerified',
				type: 'boolean',
				description: 'Email verification state of the account.',
				example: false,
			},

			{
				$id: 'accountEnabled',
				title: 'enabled',
				type: 'boolean',
				description: 'Account status.',
				example: true,
			},

			{
				$id: 'accountCreatedTimestamp',
				title: 'createdTimestamp',
				type: 'number',
				description: 'Account creation timestamp.',
				example: 1774084200938,
			},

			{
				$id: 'accountTotp',
				title: 'totp',
				type: 'boolean',
				description: 'Account status totp status.',
				example: false,
			},

			// Base account response schema (used by all account responses)
			{
				$id: 'accountBase',
				type: 'object',
				title: 'Account Base',
				description: 'Base account information.',
				properties: {
					id: { $ref: 'accountId#' },
					name: { $ref: 'name#' },
					firstName: { $ref: 'firstName#' },
					lastName: { $ref: 'lastName#' },
					email: { $ref: 'email#' },
					emailVerified: { $ref: 'accountEmailVerified#' },
					enabled: { $ref: 'accountEnabled#' },
					createdTimestamp: { $ref: 'accountCreatedTimestamp#' },
					totp: { $ref: 'accountTotp#' },
				},
				required: [
					'id',
					'name',
					'email',
					'firstName',
					'lastName',
					'emailVerified',
					'createdTimestamp',
					'totp',
				],
			},

			{
				$id: 'accountResponse200',
				description: 'Account information.',
				allOf: [{ $ref: 'accountBase#' }],
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
