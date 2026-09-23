import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FadeTruncatedText } from '@/components/FadeTruncatedText';
import { IconSwatch } from '@/components/IconSwatch';
import { Screen } from '@/components/Screen';
import { findAllWorkoutSummaries } from '@/data/sqlite/repositories/workoutRepository';
import type { ProgramDayWorkout } from '@/features/programs/types';
import type { WorkoutSummary } from '@/features/workouts/types';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

type Props = {
  visible: boolean;
  language: SupportedLanguage;
  onSelect: (workout: ProgramDayWorkout) => void;
  onClose: () => void;
};

// Assigns an existing Workout to a Program day (spec/features/program.md,
// "add a Workout to a day"). Deliberately no search/filters here, unlike
// ExerciseCatalog — Workout lists are expected to be much shorter than the
// exercise catalog, so a plain list keeps this simple.
export function WorkoutPicker({ visible, language, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    findAllWorkoutSummaries(db).then(setWorkouts);
  }, [visible, db]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen className="flex-1 bg-background">
        <View className="flex-row items-center justify-end px-4 pb-2">
          <Pressable onPress={onClose} hitSlop={12}>
            <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
          </Pressable>
        </View>
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect({ id: item.id, name: item.name, icon: item.icon })}
              className="flex-row items-center border-b border-surface-100 px-4 py-3"
            >
              <View className="mr-3">
                <IconSwatch iconId={item.icon} variant="workout" size={36} />
              </View>
              <View className="flex-1">
                <Text className="text-text text-base">{item.name}</Text>
                {item.exerciseNames.length > 0 ? (
                  <FadeTruncatedText
                    text={item.exerciseNames.map((name) => pickLocalized(name, language)).join(', ')}
                    className="text-textMuted text-sm mt-1"
                  />
                ) : null}
                <Text className="text-textMuted text-xs mt-1">
                  {t('workouts.exerciseCount', { count: item.exerciseCount })}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState message={t('workouts.empty')} compact />}
        />
      </Screen>
    </Modal>
  );
}
