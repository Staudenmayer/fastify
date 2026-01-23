/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'
import vueI18n from './vue-i18n'
import iconify from './iconify'
import highcharts from './highcharts'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(vueI18n)
    .use(iconify)
		.use(highcharts)
}
