const fastify = require('fastify')({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
	disableRequestLogging: true
});

const { MongoClient } = require('mongodb')

let mongo;

(async function connectDB() {
  mongo = new MongoClient('mongodb://localhost:27017', {
		auth: {
			username: 'user',
			password: 'pass'
		}
	})
  await mongo.connect()
})();

fastify.addHook('onResponse', (request, reply, done) => {
	if(request.method === 'GET' && request.url === '/favicon.ico') {
		return done();
	}
	request.log.info({
		method: request.method,
		path: request.url,
		body: request.body,
		params: request.params,
		statusCode: reply.statusCode,
		elapsedTime: reply.elapsedTime,
		headers: reply.getHeaders(),
	}, `${request.method} ${request.url}`);
	done();
});

// Declare a route with MongoDB query
fastify.get('/', async (request, reply) => {
  const collection = mongo.db('auth').collection('users')
  const users = await collection.find({}).limit(10).toArray()
  reply.send({
    hello: 'world',
    users: users
  })
})

// Run the server!
fastify.listen({ port: 3001 }, async (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
