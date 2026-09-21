import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ExerciseImage } from '@/components/ExerciseImage';
import { SetRow } from '@/components/SetRow';
import { ExerciseCatalog } from '@/features/exercises/components/ExerciseCatalog';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

import { useWorkoutEditor } from '../hooks/useWorkoutEditor';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  workoutId: string | undefined;
};

export function WorkoutEditor({ workoutId }: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const router = useRouter();
  const {
    name,
    setName,
    exercises,
    loading,
    saving,
    canSave,
    addExercise,
    removeExercise,
    moveExercise,
    addSet,
    removeSet,
    updateSet,
    save,
  } = useWorkoutEditor(workoutId);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (loading) {
    return <View className="flex-1 bg-background" />;
  }

  async function handleSave() {
    await save();
    router.back();
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('workouts.namePlaceholder')}
          placeholderTextColor={theme.textMuted}
          className="text-text text-xl font-semibold border-b border-surface-100 pb-2"
        />

        <View className="mt-4">
          {exercises.length === 0 ? (
            <Text className="text-textMuted mt-4">{t('workouts.noExercises')}</Text>
          ) : (
            exercises.map((workoutExercise, index) => (
              <View key={workoutExercise.id} className="mt-4 rounded-lg bg-surface p-3">
                <View className="flex-row items-center gap-3">
                  <ExerciseImage images={workoutExercise.exercise.images} size={40} />
                  <Text className="text-text flex-1 font-medium">
                    {pickLocalized(workoutExercise.exercise.name, language)}
                  </Text>
                  <Pressable onPress={() => moveExercise(workoutExercise.id, -1)} hitSlop={8} disabled={index === 0}>
                    <FontAwesome6
                      name="chevron-up"
                      iconStyle="solid"
                      color={index === 0 ? theme.surface200 : theme.textMuted}
                      size={16}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => moveExercise(workoutExercise.id, 1)}
                    hitSlop={8}
                    disabled={index === exercises.length - 1}
                  >
                    <FontAwesome6
                      name="chevron-down"
                      iconStyle="solid"
                      color={index === exercises.length - 1 ? theme.surface200 : theme.textMuted}
                      size={16}
                    />
                  </Pressable>
                  <Pressable onPress={() => removeExercise(workoutExercise.id)} hitSlop={8}>
                    <FontAwesome6 name="trash" iconStyle="solid" color={theme.textMuted} size={16} />
                  </Pressable>
                </View>

                {workoutExercise.sets.map((set, setIndex) => (
                  <SetRow
                    key={set.id}
                    index={setIndex}
                    set={set}
                    onChange={(patch) => updateSet(workoutExercise.id, set.id, patch)}
                    onRemove={() => removeSet(workoutExercise.id, set.id)}
                  />
                ))}

                <Pressable onPress={() => addSet(workoutExercise.id)} className="mt-2 flex-row items-center gap-2">
                  <FontAwesome6 name="plus" iconStyle="solid" color={theme.primary} size={12} />
                  <Text className="text-primary text-sm">{t('workouts.addSet')}</Text>
                </Pressable>
              </View>
            ))
          )}

          <Pressable
            onPress={() => setPickerOpen(true)}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-lg bg-surface-100 py-3"
          >
            <FontAwesome6 name="plus" iconStyle="solid" color={theme.text} size={14} />
            <Text className="text-text">{t('workouts.addExercises')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <Pressable
          onPress={handleSave}
          disabled={!canSave || saving}
          className={`rounded-lg py-3 items-center ${canSave && !saving ? 'bg-primary' : 'bg-surface-100'}`}
        >
          <Text className={canSave && !saving ? 'text-background font-semibold' : 'text-textMuted'}>
            {t('common.save')}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <ExerciseCatalog
          onSelect={addExercise}
          onDeselect={(exercise) => {
            const match = exercises.find((e) => e.exercise.id === exercise.id);
            if (match) {
              removeExercise(match.id);
            }
          }}
          addedExerciseIds={exercises.map((e) => e.exercise.id)}
          onClose={() => setPickerOpen(false)}
        />
      </Modal>
    </View>
  );
}
