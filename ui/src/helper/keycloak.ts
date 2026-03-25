import Keycloak from 'keycloak-js';
export const keycloak = new Keycloak({
	url: import.meta.env.VITE_KEYCLOAK_HOST,
	realm: import.meta.env.VITE_KEYCLOAK_REALM,
	clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
});
