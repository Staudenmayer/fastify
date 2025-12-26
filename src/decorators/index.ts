import type { FastifyInstance } from 'fastify';
import { decorateAuthenticate } from './authenticate';

const decorators = [decorateAuthenticate];

export default async function registerDecorators(app: FastifyInstance) {
	for (const decorator of decorators) {
		await decorator(app);
	}
}
