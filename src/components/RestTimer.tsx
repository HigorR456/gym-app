import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { formatDuration } from '@/lib/duration';
import { theme } from '@/lib/theme';

type Props = {
  remainingSeconds: number;
  isOver: boolean;
  onAdd10: () => void;
  onSubtract10: () => void;
  onSkip: () => void;
};

// spec/features/workout-execution.md, "Rest timer" — a popup over the
// interface with a countdown, Skip, +10 sec, and -10 sec. "On reaching
// zero, the timer must indicate that rest is over": isOver swaps the label
// and border color rather than auto-dismissing, since the spec never says
// it should disappear on its own — Skip remains the one way to close it.
export function RestTimer({ remainingSeconds, isOver, onAdd10, onSubtract10, onSkip }: Props) {
  const { t } = useTranslation();

  return (
    <View
      className="mx-4 mb-3 rounded-xl bg-surface p-4 flex-row items-center justify-between"
      style={{ borderWidth: isOver ? 2 : 0, borderColor: theme.primary }}
    >
      <View>
        <Text className="text-textMuted text-xs">{isOver ? t('session.restOver') : t('session.restLabel')}</Text>
        <Text className="text-text text-2xl font-semibold mt-1">{formatDuration(remainingSeconds)}</Text>
      </View>
      <View className="flex-row items-center">
        <Pressable onPress={onSubtract10} className="rounded-lg bg-surface-100 px-3 py-2" style={{ marginRight: 8 }}>
          <Text className="text-text text-sm">{t('session.subtractTenSeconds')}</Text>
        </Pressable>
        <Pressable onPress={onAdd10} className="rounded-lg bg-surface-100 px-3 py-2" style={{ marginRight: 8 }}>
          <Text className="text-text text-sm">{t('session.addTenSeconds')}</Text>
        </Pressable>
        <Pressable onPress={onSkip} className="rounded-lg bg-primary px-3 py-2">
          <Text className="text-background font-semibold text-sm">{t('session.skipRest')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
