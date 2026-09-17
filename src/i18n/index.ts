import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';

// Keep in sync with spec/technical/i18n.md, "Initial languages".
export const SUPPORTED_LANGUAGES = ['en', 'es', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function detectInitialLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode;
  return isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';
}

// This only picks an initial guess from the device locale. The persisted
// preference (see useLanguagePreference.ts) is applied on top of this once
// SQLite is ready, and always wins once the user has chosen a language —
// see spec/technical/i18n.md, "The selected language must persist locally".
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    de: { translation: de },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
