/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue';
import router from '../router';
import pinia from '../stores';
import highcharts from './highcharts';
import iconify from './iconify';
import vueI18n from './vue-i18n';

// Plugins
import vuetify from './vuetify';

export function registerPlugins(app: App) {
	app.use(vuetify).use(router).use(pinia).use(vueI18n).use(iconify).use(highcharts);
}
