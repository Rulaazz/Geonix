
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import he from './locales/he.json';
import ar from './locales/ar.json';

const savedLanguage = localStorage.getItem('geonix-language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
    ar: { translation: ar },
  },
  lng: ['en', 'he', 'ar'].includes(savedLanguage)
    ? savedLanguage
    : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem('geonix-language', language);

  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
});

document.documentElement.lang = i18n.language;
document.documentElement.dir = i18n.dir(i18n.language);

export default i18n;
