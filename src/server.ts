import Fastify from 'fastify';
import '@dotenvx/dotenvx/config';

import path from 'node:path';
import autoload from '@fastify/autoload';
import registerDecorators from './decorators';
import logger from './helpers/logger';
import registerSchemas from './schemas';
import registerPlugins from './plugins';
import saveOpenAPI from './helpers/openapi';

const port = Number.parseInt(process.env.PORT || '3000', 10);
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
			],
		},
	},
});

await registerPlugins(app);
await registerSchemas(app);
await registerDecorators(app);
await app.register(autoload, {
	dir: path.join(__dirname, 'routes'),
});

app.listen({ port: port, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		app.log.error(err);
		logger.error(`Fastify error`, err);
		process.exit(1);
	}
	logger.info(`Started Server: ${address}`);
	logger.info(`Started Swagger UI: ${address}/swagger`);
	logger.info(`Started Scalar UI: ${address}/docs`);

	saveOpenAPI(app);
});
