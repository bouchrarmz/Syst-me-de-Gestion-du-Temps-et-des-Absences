import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationAR from './locales/ar.json';

import { usePreferences } from "@/contexts/PreferencesContext";

// Détection de la langue depuis localStorage si elle existe
const userPrefs = localStorage.getItem('userPreferences');
const detectedLanguage = userPrefs ? JSON.parse(userPrefs).language || 'fr' : 'fr';

const resources = {
  fr: { translation: translationFR },
  en: { translation: translationEN },
  ar: { translation: translationAR }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
