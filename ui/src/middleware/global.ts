import type { Router } from 'vue-router';
import { useAccountData } from '@/stores/account';

export const publicPaths = ['/login', '/register'];

export function setupAuthMiddleware(router: Router) {
	router.beforeEach(async (to, from, next) => {
		const accountStore = useAccountData();
		const loggedIn = accountStore.loggedIn;
		if (!loggedIn && !publicPaths.includes(to.path)) {
			return next({
				name: '/login',
			});
		} else if (loggedIn && publicPaths.includes(to.path)) {
			return next({
				name: '/',
			});
		}
		next();
	});
}
