import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { useLanguageSetting } from '@/i18n/useLanguagePreference';
import { theme } from '@/lib/theme';

import expoConfig from '../../../../app.json';

const REPDB_URL = 'https://repdb.co';

// spec/features/settings.md — Language and About. Both live on this one
// screen (no sub-navigation): each section is small enough that a separate
// route would just be an extra tap for no real benefit.
export function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageSetting();

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        <Text className="text-text text-xl font-semibold mb-6">{t('tabs.settings')}</Text>

        <Text className="text-textMuted text-sm mb-2">{t('settings.languageLabel')}</Text>
        <View className="rounded-lg bg-surface overflow-hidden mb-8">
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <Pressable
              key={lang}
              onPress={() => void setLanguage(lang)}
              className={`flex-row items-center justify-between px-4 py-3 ${
                index > 0 ? 'border-t border-surface-100' : ''
              }`}
            >
              <Text className="text-text">{t(`settings.language.${lang}`)}</Text>
              {language === lang ? (
                <FontAwesome6 name="check" iconStyle="solid" color={theme.primary} size={16} />
              ) : null}
            </Pressable>
          ))}
        </View>

        <Text className="text-textMuted text-sm mb-2">{t('settings.aboutLabel')}</Text>
        <View className="rounded-lg bg-surface p-4">
          <Text className="text-text text-base font-medium">{expoConfig.expo.name}</Text>
          <Text className="text-textMuted text-xs mt-1">
            {t('settings.version', { version: expoConfig.expo.version })}
          </Text>
          <Text className="text-text text-sm mt-4 leading-5">{t('settings.aboutDescription')}</Text>

          <View className="mt-4 pt-4 border-t border-surface-100">
            <Text className="text-textMuted text-xs leading-5">{t('settings.datasetCredit')}</Text>
            <Pressable onPress={() => void Linking.openURL(REPDB_URL)} className="mt-2">
              {/* Exact attribution text/link required by the RepDB — Free
                  Tier License (v1.0) — spec/technical/dataset-and-licensing.md.
                  Deliberately not run through i18n (unlike the rest of this
                  screen): the license requires this exact string, and
                  translating it would no longer be that string. */}
              <Text className="text-primary text-sm">Exercise data by RepDB (repdb.co)</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
