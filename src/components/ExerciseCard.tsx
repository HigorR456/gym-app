import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Pressable, Text, View } from 'react-native';

import { ExerciseImage } from '@/components/ExerciseImage';
import type { Exercise } from '@/features/exercises/types';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

type Props = {
  exercise: Exercise;
  language: SupportedLanguage;
  onPress?: () => void;
  // Opens the detail preview without triggering onPress's action — see
  // spec/features/workout.md, "Exercise catalog (picker)". Omitted outside
  // picker mode, where the whole row already opens the preview.
  onPressInfo?: () => void;
  // Picker mode only: this exercise is already in the target Workout.
  added?: boolean;
};

export function ExerciseCard({ exercise, language, onPress, onPressInfo, added }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-surface-100 px-4 py-3"
    >
      <ExerciseImage images={exercise.images} size={48} />
      <View className="flex-1">
        <Text className="text-text text-base">{pickLocalized(exercise.name, language)}</Text>
        {exercise.bodyPart ? (
          <Text className="text-textMuted text-sm capitalize">
            {exercise.bodyPart.replace(/_/g, ' ')}
          </Text>
        ) : null}
      </View>
      {added ? (
        <FontAwesome6 name="circle-check" iconStyle="solid" color={theme.primary} size={18} />
      ) : null}
      {onPressInfo ? (
        <Pressable onPress={onPressInfo} hitSlop={8} className="pl-2">
          <FontAwesome6 name="circle-info" iconStyle="solid" color={theme.textMuted} size={18} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
