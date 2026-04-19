import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import homeEn from './locales/en/home.json'
import learningEn from './locales/en/learning.json'
import shellEn from './locales/en/shell.json'
import layoutEn from './locales/en/layout.json'

import commonEs from './locales/es/common.json'
import homeEs from './locales/es/home.json'
import learningEs from './locales/es/learning.json'

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    learning: learningEn,
    shell: shellEn,
    layout: layoutEn,
  },
  es: {
    common: commonEs,
    home: homeEs,
    learning: learningEs,
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
