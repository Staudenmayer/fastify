import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll } from 'vitest';

const mongod = await MongoMemoryServer.create(); // Declare variable in module scope

beforeAll(async () => {
	const uri = mongod.getUri();
	process.env.MONGODB_URL = uri;
});

afterAll(async () => {
  await mongod.stop();
});


function setupENV() {
	process.env.PORT = "3031";

	process.env.MONGO_USER = "";
	process.env.MONGO_PWD = "";

	process.env.COOKIE_NAME = "auth-token";

	process.env.JWT_SECRET = "some-secret-jwt-secret";

	process.env.SESSION_SECRET = "some-secret-session-secret-some-secret-session-secret";

	process.env.OTEL_SERVICE_NAME = "fastify-vitest";
	process.env.OTEL_SERVICE_VERSION = "1.0.0";
	process.env.OTEL_EXPORTER_OTLP_PROTOCOL = "http/protobuf";

	process.env.OTEL_TRACES_EXPORTER = "otlp";
	process.env.OTEL_METRICS_EXPORTER = "otlp";
	process.env.OTEL_LOGS_EXPORTER = "otlp";

	process.env.OTEL_RESOURCE_ATTRIBUTES = "deployment.environment=dev";
}


setupENV();
