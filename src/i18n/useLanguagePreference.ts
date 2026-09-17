import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getAppSetting, setAppSetting } from '@/data/sqlite/repositories/appSettingsRepository';

import { isSupportedLanguage, type SupportedLanguage } from './index';

const LANGUAGE_SETTING_KEY = 'language';

// Applies the persisted language preference once SQLite is ready (it wins
// over the device-locale guess i18next started with — see
// spec/technical/i18n.md), and persists future changes. Must be used from a
// component rendered inside both SQLiteProvider and AppProviders' i18n init.
export function useLanguagePreference() {
  const db = useSQLiteContext();
  const { i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    getAppSetting(db, LANGUAGE_SETTING_KEY).then((saved) => {
      if (!cancelled && isSupportedLanguage(saved)) {
        void i18n.changeLanguage(saved);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, i18n]);

  async function setLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);
    await setAppSetting(db, LANGUAGE_SETTING_KEY, language);
  }

  return { language: i18n.language as SupportedLanguage, setLanguage };
}
