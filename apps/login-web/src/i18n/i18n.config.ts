import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import createAccountEn from './locales/en/createAccount.json'
import loginEn from './locales/en/login.json'

const resources = {
  en: {
    common: commonEn,
    createAccount: createAccountEn,
    login: loginEn,
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
