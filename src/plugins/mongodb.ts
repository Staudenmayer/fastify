import mongodb from '@fastify/mongodb';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { FastifyInstance } from 'fastify';
import cron from 'node-cron';

dayjs.extend(utc);

const verificationTimeout: number = Number.parseInt(
	process.env.VERIFICATION_TIMEOUT || '59',
);
const threshold = dayjs()
	.utc()
	.subtract(verificationTimeout, 'minutes')
	.toDate();

export default async function registerMongo(app: FastifyInstance) {
	await app.register(mongodb, {
		forceClose: true,
		url: process.env.MONGODB_URL,
		appName: 'fastify',
		auth: {
			password: process.env.MONGO_PWD,
			username: process.env.MONGO_USER,
		},
	});

	app.addHook('onRequest', (request, _reply, done) => {
		request.mongo = app.mongo;
		done();
	});

	//handleAccountVerification(app);
}

async function handleAccountVerification(app: FastifyInstance) {
	const collection = app.mongo.client.db('auth').collection('users');

	//Update older than timeout through mongodb
	await collection.updateMany(
		{
			verified: false,
			verifiedAt: null,
			verificationCode: { $ne: null },
			createdAt: { $lt: threshold },
		},
		{ $set: { verificationCode: null } },
	);

	//Get all records that are less than timeout to set cronjob
	const findResult = collection.find({
		verified: false,
		verifiedAt: null,
		verificationCode: { $ne: null },
		createdAt: { $gt: threshold },
	});
	const recordsForJob = await findResult.toArray();
	for (const record of recordsForJob) {
		cron.schedule(`*/${verificationTimeout} * * * *`, async () => {
			await collection.updateOne(
				{
					_id: record._id,
				},
				{
					$set: {
						verificationCode: null,
					},
				},
			);
		});
	}
}
