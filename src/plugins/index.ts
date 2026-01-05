import type { FastifyInstance } from 'fastify';
import registerCookie from './cookie';
import registerCors from './cors';
import registerCSRF from './csrf';
import registerETag from './etag';
import registerHelmet from './helmet';
import registerJWT from './jwt';
import registerLogger from './logger';
import registerMongo from './mongodb';
import registerRateLimiter from './rateLimit';
import registerSession from './session';
import registerSwagger from './swagger';

const plugins = [
	registerCors,
	registerCSRF,
	registerCookie,
	registerETag,
	registerRateLimiter,
	registerJWT,
	registerSession,
	registerSwagger,
	registerHelmet,
	registerMongo,
	registerLogger,
];

export default async function registerPlugins(app: FastifyInstance) {
	for (const plugin of plugins) {
		await plugin(app);
	}
}
