import axios from 'axios';
import { keycloak } from '@/helper/keycloak';

export const fastify = axios.create({
	baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:3031',
});

fastify.interceptors.request.use(async (config) => {
	await keycloak.updateToken(30);
	config.headers = config.headers || {};
	Object.assign(config.headers, {
		Authorization: `Bearer ${keycloak.token}`,
	});
	return config;
});
