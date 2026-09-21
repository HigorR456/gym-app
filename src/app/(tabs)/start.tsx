import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';

// Placeholder — real content lands in implementation-roadmap.md step 12 (Start).
export default function StartScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-lg">{t('tabs.start')}</Text>
    </Screen>
  );
}
