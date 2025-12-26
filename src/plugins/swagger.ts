import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';

//https://zudoku.dev/

const scalarPrefix = '/docs';
const swaggerPrefix = '/swagger';
const cookieName = process.env.COOKIE_NAME || 'auth-token';

export default async function registerSwagger(app: FastifyInstance) {
	await app.register(swagger, {
		openapi: {
			info: {
				title: 'Bun Fastify JWT API',
				description: 'API with JWT authentication',
				version: '1.0.0',
			},
			tags: [
				{
					name: 'Authentication',
					description: 'Account Authentication',
				},
			],
			components: {
				securitySchemes: {
					jwtCookie: {
						type: 'apiKey',
						in: 'cookie',
						name: cookieName,
						description: 'JWT token stored in cookie',
					},
				},
			},
		},
	});

	await app.register(swaggerUI, {
		routePrefix: swaggerPrefix,
	});

	app.addHook('preHandler', async (request, reply) => {
		if (request.url.startsWith(scalarPrefix)) {
			reply.header('Content-Security-Policy', ''); // Bypass CSP
		}
	});
	await app.register(scalar, {
		routePrefix: scalarPrefix,
		configuration: {
			title: 'Title',
			pageTitle: 'Fastify API docs',
			favicon: 'https://guides.scalar.com/fallback.favicon.png',
			hiddenClients: true,
			hideModels: true,
			telemetry: false,
			showDeveloperTools: 'localhost',
			hideClientButton: true,
		},
	});
}
