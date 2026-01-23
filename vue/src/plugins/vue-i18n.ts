import { createI18n } from 'vue-i18n'
import de from '@/locals/de'
import en from '@/locals/en'

export default createI18n({
  fallbackLocale: 'en',
  locale: 'de',
  messages: {
    en: {
      ...en,
    },
    de: {
      ...de,
    },
  },
})
