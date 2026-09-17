import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseImage } from '@/components/ExerciseImage';
import type { Exercise } from '@/features/exercises/types';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

type Props = {
  exercise: Exercise | null;
  language: SupportedLanguage;
  onClose: () => void;
};

// The "confirm add to Workout" action isn't wired up here yet — this is
// just the read-only preview (spec/features/workout.md, "Exercise catalog
// (seleção)"). implementation-roadmap.md step 8 (Workout CRUD) is what
// gives this preview something to actually add the exercise to.
export function ExerciseDetail({ exercise, language, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={exercise !== null} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View className="flex-1 bg-background">
        <View
          style={{ paddingTop: insets.top }}
          className="flex-row items-center justify-end px-4 pb-2">
          <Pressable onPress={onClose} hitSlop={12}>
            <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
          </Pressable>
        </View>
        {exercise ? (
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
        ) : null}
      </View>
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
