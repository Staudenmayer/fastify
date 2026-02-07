import { defineStore } from 'pinia';
import axios from 'axios';

export type LoginData = {
	email: string;
	name: string;
	password: string;
}

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
		loggedIn: false,
	}),
	actions: {
		async login(accountData: LoginData) {
			let success = false;
			try{
				const accountResponse = await axios.post<AccountData>('/api/login', accountData);
				this.id = accountResponse.data.id;
				this.name = accountResponse.data.name;
				this.email = accountResponse.data.email;
				this.loggedIn = true;
				success = true;
			}
			catch(error){
				this.logout();
			}
			return success;
		},
		async checkLoginStatus() {
			let success = false;
			try {
				const accountResponse = await axios.get<AccountData>('/api/me');
				this.id = accountResponse.data.id;
				this.name = accountResponse.data.name;
				this.email = accountResponse.data.email;
				this.loggedIn = true;
				success = true;
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
				await axios.post('/api/logout');
			} catch (error) {}
		},
	},
});
