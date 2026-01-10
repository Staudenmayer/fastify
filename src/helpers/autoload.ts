import path from "node:path";
import autoload, { type AutoloadPluginOptions } from '@fastify/autoload';
import type { FastifyInstance } from "fastify";

export default async function(app: FastifyInstance, dir: string, options?: Partial<AutoloadPluginOptions>) {
	const mergedOptions = Object.assign({
		dir: path.join(path.dirname(__dirname), dir)
	}, options);
	await app.register(autoload, mergedOptions);
}

