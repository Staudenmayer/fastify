import { defineStore } from 'pinia';
import axios from 'axios';

export type LoginData = {
	email: string;
	password: string;
}

export type AccountData = {
	name: string;
	email: string;
	loggedIn: boolean;
};

export type ProfileData = {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
};

export const useAccountData = defineStore('account', {
	state: () => ({
		id: '',
		name: '',
		email: '',
		loggedIn: false,
	}),
	actions: {
		async login(profileData: LoginData) {
			let success = false;
			try{
				const accountResponse = await axios.post<ProfileData>('/api/login', profileData);
				this.id = accountResponse.data.id;
				this.name = accountResponse.data.username;
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
				const profileResponse = await axios.get<ProfileData>('/api/profile');
				this.id = profileResponse.data.id;
				this.name = profileResponse.data.username;
				this.email = profileResponse.data.email;
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
