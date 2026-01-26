import '@dotenvx/dotenvx/config';
import './helpers/otel';

import { context, trace } from '@opentelemetry/api';
import Fastify from 'fastify';
import autoload from './helpers/autoload.ts';
import logger from './helpers/logger.ts';

const port = Number.parseInt(process.env.PORT || '3000', 10);
const tracer = trace.getTracer('startup');
const setupSpan = tracer.startSpan('app.startup', {});
const ctx = trace.setSpan(context.active(), setupSpan);

const app = Fastify({
	logger: false,
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
		opts: {
			options: {
				blockedCountries: [],
			},
		},
	},
	{ name: 'schemas', opts: {} },
	{ name: 'decorators', opts: {} },
	{ name: 'routes', opts: {} },
];

for (const reg of regs) {
	const span = tracer.startSpan(`register.${reg.name}`, {}, ctx);
	autoload(app, reg.name, reg.opts);
	span.end();
}

const listenerSpan = tracer.startSpan(`register.listener`, {}, ctx);
app.listen({ port: port, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		app.log.error(err);
		logger.error(`Fastify error`, err);
		process.exit(1);
	}
	const logData = {};
	const mem = process.memoryUsage();
	const rss = (mem.rss / 1024 / 1024).toFixed(2);
	const heap = (mem.heapUsed / 1024 / 1024).toFixed(2);
	if (process.env.NODE_ENV === 'debug') {
		Object.assign(logData, { rss, heap });
	}
	logger.info(`Started API and Docs: ${address}/docs`, logData);
	listenerSpan.end();
	setupSpan.end();
});

export default app;
