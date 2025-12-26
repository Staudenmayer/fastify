import { FastifyReply, FastifyRequest } from 'fastify';
import type winston from 'winston';

export interface JwtPayload {
	username: string;
	email: string;
	id: string;
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;
	}
	interface FastifyRequest {
		mongo: fastifyMongodb.FastifyMongoObject &
			fastifyMongodb.FastifyMongoNestedObject;
		logger: winston.Logger;
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: JwtPayload; // what you sign
		user: JwtPayload; // what you get after verify()
	}
}
