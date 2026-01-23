import { createI18n } from 'vue-i18n'
import en from '@/locals/en'
import de from '@/locals/de'

export default createI18n({
  fallbackLocale: 'en',
  locale: 'de',
  messages: {
    en: {
      ...en
    },
    de: {
      ...de,
    }
  }
})
