import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { ExerciseImage } from '@/components/ExerciseImage';
import { Screen } from '@/components/Screen';
import type { Exercise } from '@/features/exercises/types';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

type Props = {
  exercise: Exercise | null;
  language: SupportedLanguage;
  onClose: () => void;
  // Picker mode: shows an "Add to Workout" button as a secondary path to
  // adding — the primary one is tapping the row directly in ExerciseCatalog
  // (see spec/features/workout.md). Omitted outside picker mode, where this
  // is purely informational.
  onSelect?: (exercise: Exercise) => void;
};

export function ExerciseDetail({ exercise, language, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={exercise !== null}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
      statusBarTranslucent
    >
      <Screen className="flex-1 bg-background">
        <View className="flex-row items-center justify-end px-4 pb-2">
          <Pressable onPress={onClose} hitSlop={12}>
            <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
          </Pressable>
        </View>
        {exercise ? (
          <>
            <ScrollView contentContainerClassName="px-4 pb-8">
              <View className="items-center">
                <ExerciseImage images={exercise.images} size={200} />
              </View>
              <Text className="text-text text-xl font-semibold mt-4">
                {pickLocalized(exercise.name, language)}
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {exercise.bodyPart ? <Tag label={exercise.bodyPart} /> : null}
                {exercise.equipment ? <Tag label={exercise.equipment} /> : null}
                {exercise.difficulty ? <Tag label={exercise.difficulty} /> : null}
              </View>
              {pickLocalized(exercise.description, language) ? (
                <Text className="text-text mt-4 leading-6">
                  {pickLocalized(exercise.description, language)}
                </Text>
              ) : null}
            </ScrollView>
            {onSelect ? (
              <View className="px-4 pb-6">
                <Pressable onPress={() => onSelect(exercise)} className="rounded-lg bg-primary py-3 items-center">
                  <Text className="text-background font-semibold">{t('exercises.addToWorkout')}</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </Screen>
    </Modal>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-surface-100 px-3 py-1">
      <Text className="text-textMuted text-xs capitalize">{label.replace(/_/g, ' ')}</Text>
    </View>
  );
}
