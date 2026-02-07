import posthog from 'posthog-js';

export function usePostHog() {
	if(import.meta.env.VITE_POSTHOG_TOKEN) {
		posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
			api_host: 'https://eu.i.posthog.com',
			defaults: '2025-11-30',
		});
	}
	return { posthog };
}
