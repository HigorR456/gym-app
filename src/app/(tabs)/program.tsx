import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

// Placeholder — real content lands in implementation-roadmap.md step 9 (Program CRUD).
export default function ProgramScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-lg">{t('tabs.program')}</Text>
    </View>
  );
}
