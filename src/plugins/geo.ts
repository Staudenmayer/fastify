// plugin.ts

import type {
	FastifyInstance,
	FastifyPluginCallback,
	FastifyReply,
	FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';
import geoip from 'geoip-lite';

interface GeoBlockPluginOptions {
	blockedCountries: string[]; // ISO Alpha-2 codes, e.g. ['RU', 'CN']
	errorMessage?: string;
}

const geoBlockPlugin: FastifyPluginCallback<GeoBlockPluginOptions> = fp(
	async (fastify: FastifyInstance, opts: GeoBlockPluginOptions) => {
		const {
			blockedCountries = [],
			errorMessage = 'Access denied from your region.',
		} = opts;

		fastify.addHook(
			'onRequest',
			async (request: FastifyRequest, reply: FastifyReply) => {
				// Get client IP (works with most proxies/load balancers)
				const ip =
					request.ip ||
					request.headers['x-forwarded-for']
						?.toString()
						.split(',')[0]
						?.trim() ||
					request.headers['x-real-ip']?.toString() ||
					request.socket.remoteAddress ||
					'127.0.0.1';

				const geo = geoip.lookup(ip);

				if (geo && blockedCountries.includes(geo.country)) {
					return reply.status(403).send({
						error: errorMessage,
						country: geo.country,
					});
				}
			},
		);
	},
);

export default geoBlockPlugin;
