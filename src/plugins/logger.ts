import type { FastifyInstance } from 'fastify';
import logger from '../helpers/logger';

export default async function registerLogger(app: FastifyInstance) {
	app.addHook('onRequest', (request, _reply, done) => {
		request.logger = logger;
		done();
	});

	app.addHook('onResponse', (request, reply, done) => {
		// Log single entry with all details after response is finalized
		let key: 'info' | 'warn' | 'error' = 'info';
		if (reply.statusCode >= 400) {
			key = 'error';
		}
		//else if (reply.statusCode >= 300) {
		//	key = 'warn';
		//}
		logger[key](`${request.method} ${request.url}`, {
			method: request.method,
			path: request.url,
			body: request.body,
			params: request.params,
			statusCode: reply.statusCode,
			elapsedTime: reply.elapsedTime,
			headers: reply.getHeaders(),
		});
		done();
	});
}
