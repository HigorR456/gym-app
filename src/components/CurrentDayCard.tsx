import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { ActiveSchedule } from '@/features/schedule/types';

type Props = {
  schedule: ActiveSchedule;
  onSkip: () => void;
  // Start screen only (spec/features/start.md: "Start → Program → Today's
  // Workout → Exercises") — omitted on the Schedule screen, which is purely
  // informational. Only offered for a pending workout day; a rest day has
  // nothing to start, and a 'planned' day means today's already resolved.
  onStart?: () => void;
};

// The active schedule's current day, shown prominently — shared by the
// Schedule screen (spec/features/schedule.md) and the Start screen (spec/
// features/start.md: "its current day must be the first option, shown
// prominently/emphasized"). "Skip day" is available wherever this pending
// day is shown (spec/features/schedule.md, "Manually skipping a day").
export function CurrentDayCard({ schedule, onSkip, onStart }: Props) {
  const { t } = useTranslation();
  const { currentDay, days } = schedule;
  const day = days.find((d) => d.position === currentDay.position);
  const title = currentDay.type === 'rest' ? t('programs.restDay') : (day?.workout?.name ?? '');
  const statusLabel =
    currentDay.type === 'rest'
      ? t('schedule.restDayToday')
      : currentDay.state === 'planned'
        ? t('schedule.plannedWorkout')
        : currentDay.overdue
          ? t('schedule.overdueWorkout')
          : t('schedule.pendingWorkout');

  return (
    <View className="rounded-lg bg-surface p-4">
      <Text className="text-textMuted text-xs">{t('programs.dayLabel', { number: currentDay.position + 1 })}</Text>
      <Text className="text-text text-base font-medium mt-1">{title}</Text>
      <Text className="text-textMuted text-sm mt-1">{statusLabel}</Text>
      {currentDay.type === 'workout' && currentDay.state === 'pending' ? (
        <View className="flex-row items-center mt-3">
          {onStart ? (
            <Pressable onPress={onStart} style={{ marginRight: 20 }}>
              <Text className="text-primary text-sm font-semibold">{t('start.startWorkout')}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onSkip}>
            <Text className="text-primary text-sm">{t('schedule.skipDay')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
