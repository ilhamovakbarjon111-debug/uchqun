import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en/common.json';
import ru from '../locales/ru/common.json';
import uz from '../locales/uz/common.json';

const LANGUAGE_KEY = '@app_language';

// Get the device's locale
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

// Initialize i18n
const initI18n = async () => {
  try {
    // Try to get saved language
    let savedLanguage = null;
    try {
      savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    } catch (storageError) {
      console.warn('[i18n] Failed to read from AsyncStorage:', storageError);
    }
    const initialLanguage = savedLanguage || deviceLanguage || 'en';

    i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          en: { translation: en },
          ru: { translation: ru },
          uz: { translation: uz },
        },
        lng: initialLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('[i18n] Initialization error:', error);
    // Fallback initialization without async storage
    i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          en: { translation: en },
          ru: { translation: ru },
          uz: { translation: uz },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  }
};

// Change language function
export const changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('[i18n] Failed to change language:', error);
    // Still change language even if storage fails
    i18n.changeLanguage(language);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.language || 'en';

// Get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'uz', name: 'Uzbek', nativeName: "O'zbek" },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

// Initialize i18n with error handling
initI18n().catch((error) => {
  console.error('[i18n] Failed to initialize:', error);
});

export default i18n;
