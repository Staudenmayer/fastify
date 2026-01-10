import etag from '@fastify/etag';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async function registerETag(app: FastifyInstance) {
		await app.register(etag);
	},
	{
		name: 'etag',
	},
);
