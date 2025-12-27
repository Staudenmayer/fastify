import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import logger from './logger';
import type { Context, Tracer } from '@opentelemetry/api';

export default async function saveOpenAPI(app: FastifyInstance, tracer: Tracer, ctx: Context) {
	const span = tracer.startSpan(`save.openapi`, {}, ctx);
	const spec = app.swagger({ yaml: true });
	const fileName = 'openapi.yml';
	const filePath = path.join(process.cwd(), fileName);
	await fs.writeFile(filePath, spec).catch((err) =>
		logger.error(`Failed to save openapi spec to ${fileName}`, err),
	);
	span.end();
}
