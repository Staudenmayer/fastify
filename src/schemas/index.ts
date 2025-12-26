import type { FastifyInstance } from 'fastify';
import * as account from './account';
import * as error from './errors';

const schemas = [account, error];

export default function (app: FastifyInstance) {
	for (const schema of schemas) {
		for (const key in schema) {
			app.addSchema(schema[key as keyof typeof schema]);
		}
	}
}
