import jwt from 'jsonwebtoken';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export const keycloak = axios.create({
	baseURL: process.env.KEYCLOAK_HOST,
});

const tokenUrl = `realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

let timeUntilRenew = 0;
let rawToken: string | null;
let token: string | jwt.JwtPayload | null = null;

function tokenIsValidFor(time: number) {
	let valid = false;
	if (token && typeof token !== 'string' && typeof token.exp === 'number') {
		const nowUtc = dayjs.utc();
		const diffInSeconds = Math.abs(
			dayjs.unix(token.exp).utc().diff(nowUtc, 'second'),
		);
		timeUntilRenew = diffInSeconds;
		valid = diffInSeconds > time;
	}
	return valid;
}

async function getToken() {
	if (timeUntilRenew <= 30) {
		const params = new URLSearchParams();
		params.append('client_id', process.env.KEYCLOAK_CLIENT_ID!);
		params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET!); // fixed typo
		params.append('grant_type', 'client_credentials');
		try {
			const { data } = await keycloak.post(tokenUrl, params);
			rawToken = data.access_token;
			token = jwt.decode(data.access_token);
		} catch (error) {
			console.error(error);
		}
	}
}

keycloak.interceptors.request.use(async (config) => {
	if (config && config.method === 'post' && config.url === tokenUrl) {
		return config;
	}
	if (!tokenIsValidFor(30)) {
		await getToken();
	}
	config.headers = config.headers || {};
	Object.assign(config.headers, { Authorization: `Bearer ${rawToken}` });
	return config;
});
