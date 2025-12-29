import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';

const scalarPrefix = '/docs';
const swaggerPrefix = '/swagger';
const cookieName = process.env.COOKIE_NAME || 'auth-token';
const schemasToDel = new Set<string>([]);

type PathData = {
	[key: string]: {
		content: {
			[key: string]: {
				schema: {
					properties: {
						[key: string]: {
							$ref?: string
						}
					}
				}
			}
		}
	}
};

type Paths = {
	[key: string]: {
		[key: string]: {
			responses?: PathData,
			requestBody?: PathData,
			parameters?: PathData,
		}
	}
}

function filterHidden(typePath: Paths, schemas: any) {
	const searchProps = [
		'responses',
		'requestBody',
	];

	for(const [key, value] of Object.entries(schemas)) {
		const typedValue = value as {hidden?: boolean};
		if(Object.hasOwn(typedValue, 'hidden') && typedValue.hidden) {
			schemasToDel.add(key);
			delete schemas[key];
		}
	}

	for(const path of Object.values(typePath)){
		for(const method of Object.values(path)) {
			for(const [key, value] of Object.entries(method)) {
				if(!searchProps.includes(key)) {
					continue;
				}
				for(const data of Object.values(value)) {
					console.log(data)
					if(!data || !data.content) {
						continue;
					}
					for(const value of Object.values(data.content)) {
						if(!value || !value.schema || !value.schema.properties) {
							continue;
						}
						for(const [key, data] of Object.entries(value.schema.properties)) {
							if(!Object.hasOwn(data, '$ref')) {
								continue;
							}
							const x = data.$ref!.split('/');
							if(schemasToDel.has(x[x.length - 1]!))
								delete value.schema.properties[key];
						}
					}
				}
			}
		}
	}
	return typePath;
}

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
		transform: (spec: any) => {
			const openapiObject = spec.openapiObject;
			const schemas = openapiObject?.components?.schemas ?? {};
			const paths = openapiObject?.paths ?? {};

			const result: any = JSON.parse(JSON.stringify(spec));

			result.openapiObject.paths = filterHidden(paths, schemas);
			return result;
		}
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
