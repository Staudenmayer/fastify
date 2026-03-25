import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export default fp(
	async (app: FastifyInstance) => {
		const issuer = process.env.KEYCLOAK_ISSUER?.replace(/\/$/, '');
		const audience = process.env.KEYCLOAK_AUDIENCE;

		if (!issuer || !audience) {
			throw new Error('Missing KEYCLOAK_ISSUER or KEYCLOAK_AUDIENCE');
		}

		// Load Keycloak OIDC discovery once at startup
		const discoveryResponse = await fetch(
			`${issuer}/.well-known/openid-configuration`,
		);
		if (!discoveryResponse.ok) {
			throw new Error(
				`Failed to load OIDC discovery: ${discoveryResponse.status}`,
			);
		}

		const discovery = (await discoveryResponse.json()) as { jwks_uri: string };
		const JWKS = createRemoteJWKSet(new URL(discovery.jwks_uri));

		app.decorate(
			'authenticate',
			async (request: FastifyRequest, reply: FastifyReply) => {
				const authHeader = request.headers.authorization;

				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					reply.unauthorized('Missing bearer token');
					return;
				}

				const token = authHeader.slice('Bearer '.length);

				try {
					const { payload } = await jwtVerify(token, JWKS, {
						issuer,
						audience,
					});
					request.user = payload;
				} catch (error) {
					request.log.warn({ error }, 'Token verification failed');
					reply.unauthorized('Invalid or expired token');
				}
			},
		);
	},
	{
		name: 'authenticate-decorator',
	},
);
