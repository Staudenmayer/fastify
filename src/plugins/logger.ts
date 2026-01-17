import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import logger from '../helpers/logger.ts';

export default fp(
	async (app: FastifyInstance) => {
		app.addHook('onRequest', (request, reply, done) => {
			request.logger = logger;
			reply.logData = {};
			reply.addLogData = (data: object) => {
				reply.logData = Object.assign(reply.logData, data);
			};
			done();
		});

		app.addHook('onResponse', (request, reply, done) => {
			if(request.method === 'GET' && /^\/docs\/.*/.exec(request.url)) {
				return done();
			}
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
				data: reply.logData,
			});
			done();
		});
	},
	{
		name: 'logger',
	},
);
