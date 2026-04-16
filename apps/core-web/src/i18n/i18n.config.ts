import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import homeEn from './locales/en/home.json'
import layoutEn from './locales/en/layout.json'
import shellEn from './locales/en/shell.json'

import commonEs from './locales/es/common.json'
import homeEs from './locales/es/home.json'
import layoutEs from './locales/es/layout.json'
import shellEs from './locales/es/shell.json'

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    layout: layoutEn,
    shell: shellEn,
  },
  es: {
    common: commonEs,
    home: homeEs,
    layout: layoutEs,
    shell: shellEs,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
