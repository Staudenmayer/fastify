import { createPinia } from 'pinia';
import router from '../router';
import i18n from './i18n';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue';
// Plugins
import highcharts from './highcharts';
import vuetify from './vuetify';
import iconify from './iconify';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export function registerPlugins(app: App) {
	app.use(vuetify);
	app.use(createPinia());
	app.use(i18n);
	app.use(router);
	app.use(highcharts);
	app.use(iconify);
}
