import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import es from './locales/es.json'
import eu from './locales/eu.json'
import en from './locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    eu: { translation: eu },
    en: { translation: en },
  },
  lng: localStorage.getItem('ot_lang') || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n