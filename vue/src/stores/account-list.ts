import { defineStore } from 'pinia';

export type Account = {
	id: string;
	name: string;
	email: string;
	status: 'online' | 'offline';
	description: string;
	avatar?: string;
	avatarFailed?: boolean;
};

export const useAccountListData = defineStore('account-list', {
	state: (): Account[] => [
	{
		id: '1',
		name: 'John Doe',
		email: 'test@test.com',
		status: 'online',
		description: 'First item description',
		avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: '2',
		name: 'Jane Smith',
		email: 'test@test.com',
		status: 'offline',
		description: 'Second item description',
		avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: '3',
		name: 'Bob Johnson',
		email: 'test@test.com',
		status: 'online',
		description: 'Third item description',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: '4',
		name: 'Alice Brown',
		email: 'test@test.com',
		status: 'online',
		description: 'Fourth item description',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
	},
	{
		id: '5',
		name: 'Charlie Wilson',
		email: 'test@test.com',
		status: 'offline',
		description: 'Fifth item description',
		avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
	},
],
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
		}
	},

});
