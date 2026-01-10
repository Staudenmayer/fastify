import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import mongodb from 'mongodb';
import cron from 'node-cron';
import { verificationTimeout } from '../defaults/auth';
import { minToCron } from '../helpers/cron';

dayjs.extend(utc);

const threshold = dayjs()
	.utc()
	.subtract(verificationTimeout, 'minutes')
	.toDate();

export default fp(
	async (app: FastifyInstance) => {
		const client = new mongodb.MongoClient(process.env.MONGODB_URL!, {
			appName: 'fastify',
			auth: {
				password: process.env.MONGODB_PWD,
				username: process.env.MONGODB_USER,
			},
			connectTimeoutMS: 1000,
			maxPoolSize: 25,
			minPoolSize: 2,
		});
		app.mongo = {
			client,
		};

		app.addHook('onRequest', (request, _reply, done) => {
			request.mongo = app.mongo;
			done();
		});

		handleAccountVerification(app);
	},
	{
		name: 'mongodb',
	},
);

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
		cron.schedule(
			minToCron(verificationTimeout),
			async () => {
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
			},
			{
				timezone: 'Etc/UTC',
			},
		);
	}
}
