import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async function decorateAuthenticate(app: FastifyInstance) {
	app.decorate(
		'authenticate',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const token = request.cookies[process.env.COOKIE_NAME || 'auth-token'];
			if (!token) {
				return reply.status(401).send({
					message: 'Authentication required!',
				});
			}
			try {
				request.user = app.jwt.verify(token);
			} catch (err) {
				reply.send(err);
			}
		},
	);
}
