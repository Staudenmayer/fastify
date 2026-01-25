import { defineStore } from 'pinia';

export type AccountData = {
	name: string;
	email: string;
	loggedIn: boolean;
};

export const useAccountData = defineStore('account', {
	state: () => ({
		name: '',
		email: '',
		loggedIn: false,
	}),
	actions: {
		login(profileData: AccountData) {
			this.name = profileData.name;
			this.email = profileData.email;
			this.loggedIn = true;
		},
		logout() {
			this.name = '';
			this.email = '';
			this.loggedIn = false;
		},
	},
});
