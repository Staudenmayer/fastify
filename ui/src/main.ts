/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue';

// Plugins
import { registerPlugins } from '@/plugins';

// Components
import App from './App.vue';

// Styles
import 'unfonts.css';
import './styles/tailwind.css';
import './styles/main.scss';

import { keycloak } from './helper/keycloak';
import { useAccountData } from '@/stores/account';

keycloak.init({ onLoad: 'login-required' }).then(() => {
	const app = createApp(App);

	registerPlugins(app);

	app.mount('#app');
	app.provide('keycloak', keycloak);
	const accountStore = useAccountData();
	accountStore.login();
});
