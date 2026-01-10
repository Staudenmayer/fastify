import '@dotenvx/dotenvx/config';
import './helpers/otel';

import path from 'node:path';
import autoload from '@fastify/autoload';
import { context, trace } from '@opentelemetry/api';
import Fastify, { type FastifyInstance } from 'fastify';
import registerDecorators from './decorators';
import logger from './helpers/logger';
import registerSchemas from './schemas';

const port = Number.parseInt(process.env.PORT || '3000', 10);
const tracer = trace.getTracer('startup');
const setupSpan = tracer.startSpan('app.startup', {});
const ctx = trace.setSpan(context.active(), setupSpan);

const app = Fastify({
	logger: process.env.LOGGING === '1',
	ajv: {
		customOptions: {
			keywords: [
				{
					//allow example in a schema definition as this is allowed for openapi / swagger
					keyword: 'example',
					errors: false,
				},
				{
					//allow example in a schema definition as this is allowed for openapi / swagger
					keyword: 'hidden',
					errors: false,
				},
			],
		},
	},
});

const regs = [
	{
		name: 'plugins',
		function: async (app: FastifyInstance) => {
			await app.register(autoload, {
				dir: path.join(__dirname, 'plugins'),
			});
		},
	},
	{
		name: 'schemas',
		function: registerSchemas,
	},
	{
		name: 'decorators',
		function: registerDecorators,
	},
	{
		name: 'routes',
		function: async (app: FastifyInstance) => {
			await app.register(autoload, {
				dir: path.join(__dirname, 'routes'),
			});
		},
	},
];

for (const reg of regs) {
	const span = tracer.startSpan(`register.${reg.name}`, {}, ctx);
	await reg.function(app);
	span.end();
}

const listenerSpan = tracer.startSpan(`register.listener`, {}, ctx);
app.listen({ port: port, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		app.log.error(err);
		logger.error(`Fastify error`, err);
		process.exit(1);
	}
	logger.info(`Started Server: ${address}`);
	logger.info(`Started Swagger UI: ${address}/swagger`);
	logger.info(`Started Scalar UI: ${address}/docs`);
	listenerSpan.end();
});

app.ready(() => {
	setupSpan.end();
});
