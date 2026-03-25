import { defineStore } from 'pinia';
import { keycloak } from '@/helper/keycloak';
import { fastify } from '@/apis/fastify';

export type LoginData = {
	email: string;
	name: string;
	password: string;
};

export type AccountData = {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
};

export type AccountState = {
	id: string;
	name: string;
	email: string;
	loggedIn: boolean;
};

export const useAccountData = defineStore('account', {
	state: () => ({
		id: '',
		name: '',
		email: '',
		loggedIn: !!keycloak.authenticated,
	}),
	actions: {
		async login() {
			let success = false;
			try {
				if (!this.loggedIn) {
					await keycloak?.login();
				}
				if (keycloak?.tokenParsed) {
					this.name = keycloak.tokenParsed.name;
					this.email = keycloak.tokenParsed.email;
					this.id = keycloak.tokenParsed.sub!;
				}
				await fastify.get('/me');
				this.loggedIn = !!keycloak?.authenticated;
				success = this.loggedIn;
			} catch (error) {
				this.logout();
			}
			return success;
		},
		async logout() {
			this.id = '';
			this.name = '';
			this.email = '';
			this.loggedIn = false;
			try {
				keycloak?.logout();
			} catch (error) {}
		},
	},
});
