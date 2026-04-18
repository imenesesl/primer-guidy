import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import homeEn from './locales/en/home.json'
import learningEn from './locales/en/learning.json'
import shellEn from './locales/en/shell.json'
import layoutEn from './locales/en/layout.json'

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    learning: learningEn,
    shell: shellEn,
    layout: layoutEn,
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
