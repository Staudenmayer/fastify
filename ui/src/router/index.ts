/**
 * router/index.ts
 *
 * Automatic routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';
import { setupAuthMiddleware } from '@/middleware/global';
import { usePostHog } from '@/composables/posthog';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

setupAuthMiddleware(router);

const { posthog } = usePostHog();

export default router;
