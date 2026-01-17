import { FastifyReply, FastifyRequest } from 'fastify';
import type winston from 'winston';
import type { MongoClient } from 'mongodb';

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
		mongo: {
			client: MongoClient;
		};
	}
	interface FastifyRequest {
		mongo: {
			client: MongoClient;
		};
		logger: winston.Logger;
	}
	interface FastifyReply {
		logData: object;
		addLogData: (data: object) => void;
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: JwtPayload; // what you sign
		user: JwtPayload; // what you get after verify()
	}
}
