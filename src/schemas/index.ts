import type { FastifyInstance } from 'fastify';
import * as account from './account';
import * as http from './http';

const schemas = [account, http];

export default function (app: FastifyInstance) {
	for (const schema of schemas) {
		for (const key in schema) {
			app.addSchema(schema[key as keyof typeof schema]);
		}
	}
}
