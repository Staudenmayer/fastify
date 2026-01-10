import throttle from '@fastify/throttle';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(throttle, {
			bytesPerSecond: 1024 * 1024, // 1MB/s
  		streamPayloads: true, // throttle the payload if it is a stream
  		bufferPayloads: true, // throttle the payload if it is a Buffer
  		stringPayloads: true // throttle the payload if it is a string
		});
	},
	{
		name: 'throttle',
	},
);
