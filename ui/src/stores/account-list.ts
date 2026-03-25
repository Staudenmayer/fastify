import { defineStore } from 'pinia';
import { fastify } from '@/apis/fastify';

export type Account = {
	id: string;
	name: string;
	email: string;
	description: string;
	avatar?: string;
	avatarFailed?: boolean;
};

export const useAccountListData = defineStore('account-list', {
	state: (): Account[] => [],
	actions: {
		deleteAccount(id: string) {
			const index = this.$state.findIndex((account) => account.id === id);
			if (index !== -1) {
				this.$state.splice(index, 1);
			}
		},
		addAccount(account: Account) {
			// Adds a new account if the ID doesn’t already exist
			const exists = this.$state.some((a) => a.id === account.id);
			if (!exists) {
				this.$state.push(account);
			} else {
				console.warn(`Account with id ${account.id} already exists.`);
			}
		},
		getAccount(id: string) {
			return this.$state.find((account) => account.id === id);
		},
		async getAccounts() {
			const accountsResponse = await fastify.get('/accounts');
			const mappedAccounts = accountsResponse.data.map((el) => {
				return {
					id: el.id,
					name: el.name,
					email: el.email,
					description: `${el.firstName} ${el.lastName}`,
					avatar:
						'https://avatars.githubusercontent.com/u/35968425?v=4&size=48',
				};
			});
			this.$state.length = 0;
			this.$state.push(...mappedAccounts);
			return this.$state;
		},
	},
});
