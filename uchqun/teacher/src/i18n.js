import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/common.json';
import uz from './locales/uz/common.json';
import ru from './locales/ru/common.json';

// Parent app translations
import enParent from './parent/locales/en/common.json';
import uzParent from './parent/locales/uz/common.json';
import ruParent from './parent/locales/ru/common.json';

// Deep merge helper to combine teacher + parent dictionaries
const mergeDeep = (base, extra) => {
  const result = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeDeep(result[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
};

const resources = {
  en: { translation: mergeDeep(en, enParent) },
  uz: { translation: mergeDeep(uz, uzParent) },
  ru: { translation: mergeDeep(ru, ruParent) },
};

// Load translations from bundled JSON instead of fetching from /public,
// and use the default "translation" namespace to match useTranslation().
i18n.use(initReactI18next).init({
  resources,
  lng: ['en', 'uz', 'ru'].includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'uz', 'ru'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  initImmediate: false, // keep sync when resources are bundled
});

if (import.meta.env.DEV) {
  // Quick debug to verify translations are loaded
  // eslint-disable-next-line no-console
  console.log('i18n resources loaded:', Object.keys(i18n.options.resources || {}));
}

export const changeLanguage = (lng) => {
  localStorage.setItem('lang', lng);
  i18n.changeLanguage(lng);
};

export default i18n;
