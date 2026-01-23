import posthog from 'posthog-js';

export function usePostHog() {
	posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
		api_host: 'https://eu.i.posthog.com',
		defaults: '2025-11-30',
	});

	return { posthog };
}
