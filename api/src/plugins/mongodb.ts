import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import mongodb from 'mongodb';

export default fp(
	async (app: FastifyInstance) => {
		const client = new mongodb.MongoClient(process.env.MONGODB_URL ?? '', {
			appName: 'fastify',
			auth: {
				password: process.env.MONGODB_PWD,
				username: process.env.MONGODB_USER,
			},
			connectTimeoutMS: 1000,
			maxPoolSize: 25,
			minPoolSize: 2,
		});
		app.mongo = {
			client,
		};

		app.addHook('onRequest', (request, _reply, done) => {
			request.mongo = app.mongo;
			done();
		});
	},
	{
		name: 'mongodb',
	},
);
