import { expect, test, describe, beforeAll } from 'vitest'
import app from '../src/server'


describe('Basic', () => {
	beforeAll(async () => {
		await new Promise(resolve => {
			app.ready(resolve);
		})
	});
	test('Login', async () => {
		const result = await app.inject({
			method: 'POST',
			path: '/login',
			body: {
				email: 'invalid@nowhere.com',
				password: 'password123!',
			}
		});
		expect(result.statusCode).toEqual(401);
	})
});

