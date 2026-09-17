import { Pressable, Text, View } from 'react-native';

import { ExerciseImage } from '@/components/ExerciseImage';
import type { Exercise } from '@/features/exercises/types';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';

type Props = {
  exercise: Exercise;
  language: SupportedLanguage;
  onPress?: () => void;
};

export function ExerciseCard({ exercise, language, onPress }: Props) {
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
    </Pressable>
  );
}
