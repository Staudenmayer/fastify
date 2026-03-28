import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export const keycloak = axios.create({
	baseURL: process.env.KEYCLOAK_HOST!,
});

const tokenUrl = `realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

let rawToken: string | null = null;
let tokenExpiresAt: number | null = null; // UTC timestamp when token expires

function tokenIsValidFor(secondsBuffer: number) {
	if (!tokenExpiresAt) return false;
	const nowUtc = dayjs.utc().unix();
	return tokenExpiresAt - nowUtc > secondsBuffer;
}

async function getToken() {
	const params = new URLSearchParams();
	params.append('client_id', process.env.KEYCLOAK_CLIENT_ID!);
	params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET!);
	params.append('grant_type', 'client_credentials');

	const { data } = await keycloak.post(tokenUrl, params);
	rawToken = data.access_token;
	tokenExpiresAt = dayjs.utc().unix() + data.expires_in; // use Keycloak's expires_in
	return rawToken;
}

keycloak.interceptors.request.use(
	async (config) => {
		// Skip refresh for the token endpoint itself to avoid infinite loop
		if (config.method === 'post' && config.url === tokenUrl) {
			return config;
		}

		// Only refresh if token is missing or about to expire
		if (!tokenIsValidFor(30)) {
			await getToken();
		}

		config.headers = config.headers || {};
		Object.assign(config.headers, { Authorization: `Bearer ${rawToken}` });
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);
