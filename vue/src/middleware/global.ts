import type { Router } from 'vue-router';
import { useAccountData } from '@/stores/account';

const publicPaths = [
	'/login',
	'/register',
];

export function setupAuthMiddleware(router: Router) {
	router.beforeEach(async (to, from, next) => {
		const accountStore = useAccountData();
		let loggedIn = accountStore.loggedIn;
		if(!accountStore.loggedIn) {
			await accountStore.checkLoginStatus();
			loggedIn = accountStore.loggedIn;
		}
		if (!loggedIn && !publicPaths.includes(to.path)) {
			return next({
				name: '/login',
			});
		}
		else if(loggedIn && publicPaths.includes(to.path)) {
			return next({
				name: '/'
			});
		}
		next();
	});
}
