const fastify = require('fastify')({
	logger: false
});
const logger = require('./logger.js');

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

fastify.addHook('onRequest', (request, _reply, done) => {
	request.logger = logger;
	done();
});

fastify.addHook('onResponse', (request, reply, done) => {
	if(request.method === 'GET' && request.url === '/favicon.ico') {
		return done();
	}
	let key = 'info';
	if (reply.statusCode >= 400) {
		key = 'error';
	}
	logger[key](`${request.method} ${request.url}`, {
		method: request.method,
		path: request.url,
		body: request.body,
		params: request.params,
		statusCode: reply.statusCode,
		elapsedTime: reply.elapsedTime,
		headers: reply.getHeaders(),
	});
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
fastify.listen({ port: 3001 }, async (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
	logger.info(address);
})
