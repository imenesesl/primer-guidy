import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import activityEn from './locales/en/activity.json'
import channelsEn from './locales/en/channels.json'
import commonEn from './locales/en/common.json'
import directoriesEn from './locales/en/directories.json'
import homeEn from './locales/en/home.json'
import layoutEn from './locales/en/layout.json'
import shellEn from './locales/en/shell.json'

import activityEs from './locales/es/activity.json'
import channelsEs from './locales/es/channels.json'
import commonEs from './locales/es/common.json'
import directoriesEs from './locales/es/directories.json'
import homeEs from './locales/es/home.json'
import layoutEs from './locales/es/layout.json'
import shellEs from './locales/es/shell.json'

const resources = {
  en: {
    activity: activityEn,
    channels: channelsEn,
    common: commonEn,
    directories: directoriesEn,
    home: homeEn,
    layout: layoutEn,
    shell: shellEn,
  },
  es: {
    activity: activityEs,
    channels: channelsEs,
    common: commonEs,
    directories: directoriesEs,
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
