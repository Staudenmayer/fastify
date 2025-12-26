import fs from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import logger from './logger';

export default function saveOpenAPI(app: FastifyInstance) {
	const spec = app.swagger({ yaml: true });
	const fileName = 'openapi.yml';
	const filePath = path.join(process.cwd(), fileName);
	fs.writeFile(filePath, spec).catch((err) =>
		logger.error(`Failed to save openapi spec to ${fileName}`, err),
	);
}
