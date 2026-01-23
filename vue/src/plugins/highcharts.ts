import type { App } from 'vue'
import HighchartsVue from 'highcharts-vue'

export default {
  install (app: App) {
    app.use(HighchartsVue)
  },
}
