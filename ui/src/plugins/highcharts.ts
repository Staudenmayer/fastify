import HighchartsVue from 'highcharts-vue';
import type { App } from 'vue';

export default {
	install(app: App) {
		app.use(HighchartsVue);
	},
};
