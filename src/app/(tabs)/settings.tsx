import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';

// Placeholder — real content lands in implementation-roadmap.md step 17 (Settings/About).
export default function SettingsTab() {
  const { t } = useTranslation();

  return (
    <Screen className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-lg">{t('tabs.settings')}</Text>
    </Screen>
  );
}
