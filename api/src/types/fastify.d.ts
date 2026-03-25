import { FastifyReply, FastifyRequest } from 'fastify';
import type winston from 'winston';
import type { MongoClient } from 'mongodb';
import type { HttpErrors } from '@fastify/sensible';
import type { FastifyRedis } from '@fastify/redis';

export type AuthenticatedUser = JWTPayload & {
	preferred_username?: string;
	email?: string;
	realm_access?: {
		roles?: string[];
	};
	resource_access?: Record<string, { roles?: string[] }>;
};

export interface JwtPayload {
	name: string;
	email: string;
	id: string;
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;
		mongo: {
			client: MongoClient;
		};
		redis: FastifyRedis | null;
	}
	interface FastifyRequest {
		mongo: {
			client: MongoClient;
		};
		redis: FastifyRedis;
		user: AuthenticatedUser | null;
		logger: winston.Logger;
	}

	interface FastifyReply extends HttpErrors {}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: JwtPayload; // what you sign
		user: JwtPayload; // what you get after verify()
	}
}
