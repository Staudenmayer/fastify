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
				$id: 'accountId',
				title: 'id',
				type: 'string',
				format: 'uuid',
				description: "The account's id.",
				example: '550e8400-e29b-41d4-a716-446655440000',
			},

			{
				$id: 'accountCreatedAt',
				title: 'createdAt',
				type: 'string',
				format: 'date-time',
				description: 'Account creation date.',
				example: '2026-01-13T18:29:00.000Z',
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
					email: { $ref: 'email#' },
					createdAt: { $ref: 'accountCreatedAt#' },
				},
				required: ['id', 'name', 'email'],
			},

			// Body schemas
			{
				$id: 'registerBody',
				type: 'object',
				title: 'Register Body',
				required: ['name', 'email', 'password'],
				properties: {
					name: { $ref: 'name#' },
					email: { $ref: 'email#' },
					password: { $ref: 'password#' },
				},
			},

			{
				$id: 'loginBody',
				type: 'object',
				title: 'Login Body',
				required: ['email', 'password'],
				properties: {
					email: { $ref: 'email#' },
					password: { $ref: 'password#' },
				},
			},

			// Response schemas
			{
				$id: 'registerResponse200',
				description:
					'Successful registration. Returns account ID, sets session cookie.',
				allOf: [{ $ref: 'accountBase#' }],
			},

			{
				$id: 'loginResponse200',
				description: 'Successful login. Returns account info.',
				allOf: [{ $ref: 'accountBase#' }],
			},

			{
				$id: 'accountResponse200',
				description: 'Account information.',
				allOf: [{ $ref: 'accountBase#' }],
			},

			{
				$id: 'empty204',
				type: 'null',
				description: 'No content',
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
