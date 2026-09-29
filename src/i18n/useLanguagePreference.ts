import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { getAppSetting, setAppSetting } from '@/data/sqlite/repositories/appSettingsRepository';

import { isSupportedLanguage, type SupportedLanguage } from './index';

const LANGUAGE_SETTING_KEY = 'language';

// Loads the persisted language preference once when the app starts.
// i18next may initially use the device locale, so the value stored in
// SQLite takes precedence after the database is ready.
//
// This hook should only be used at the app root. The ref prevents the
// initialization effect from running again when i18n changes language.
export function useApplyPersistedLanguagePreference(): void {
  const db = useSQLiteContext();
  const { i18n } = useTranslation();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    let cancelled = false;

    const loadLanguage = async () => {
      const saved = await getAppSetting(db, LANGUAGE_SETTING_KEY);

      if (!cancelled && isSupportedLanguage(saved)) {
        await i18n.changeLanguage(saved);
      }
    };

    void loadLanguage();

    return () => {
      cancelled = true;
    };
  }, [db, i18n]);
}

// Returns the current language and provides a setter that changes the
// i18next language and persists the new value in SQLite.
//
// Multiple language changes can be requested before the previous change
// finishes. The refs below serialize those changes and ensure that the
// latest requested language is the final one applied and persisted.
export function useLanguageSetting() {
  const db = useSQLiteContext();
  const { i18n } = useTranslation();

  const pendingRef = useRef<Promise<void> | null>(null);
  const nextRef = useRef<SupportedLanguage | null>(null);

  function setLanguage(language: SupportedLanguage): Promise<void> {
    nextRef.current = language;

    if (!pendingRef.current) {
      pendingRef.current = (async () => {
        while (nextRef.current !== null) {
          const target = nextRef.current;
          nextRef.current = null;

          await i18n.changeLanguage(target);
          await setAppSetting(db, LANGUAGE_SETTING_KEY, target);
        }

        pendingRef.current = null;
      })();
    }

    return pendingRef.current;
  }

  return { language: i18n.language as SupportedLanguage, setLanguage };
}