import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		app.decorate(
			'authenticate',
			async (request: FastifyRequest, reply: FastifyReply) => {
				const token = request.cookies[process.env.COOKIE_NAME || 'auth-token'];
				if (!token) {
					return reply.unauthorized('Authentication required!');
				}
				try {
					request.user = app.jwt.verify(token);
				} catch (err) {
					reply.send(err);
				}
			},
		);
	},
	{
		name: 'authenticate-decorator',
	},
);
