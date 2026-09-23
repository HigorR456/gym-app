import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';

// Placeholder — the real exercise/execution screen lands in
// implementation-roadmap.md step 13 (Workout execution). Step 12 (Start)
// only owns the decision of *which* Workout starts and whether it cancels
// an active schedule (spec/features/start.md); no workout_sessions row is
// created here since starting a session, its timer, and its recovery are
// all step 13-15 concerns (see spec/features/workout-execution.md).
export default function SessionRoute() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { t } = useTranslation();

  return (
    <Screen className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-text text-lg text-center">{t('start.executionPlaceholder')}</Text>
      <Text className="text-textMuted text-sm text-center mt-2">{workoutId}</Text>
    </Screen>
  );
}
