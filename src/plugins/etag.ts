import etag from '@fastify/etag';
import type { FastifyInstance } from 'fastify';

export default async function registerETag(app: FastifyInstance) {
	await app.register(etag);
}
