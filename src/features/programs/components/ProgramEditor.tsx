import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { SupportedLanguage } from '@/i18n';
import { theme } from '@/lib/theme';

import { useProgramEditor } from '../hooks/useProgramEditor';
import type { ProgramDayWorkout } from '../types';
import { WorkoutPicker } from './WorkoutPicker';

type Props = {
  programId: string | undefined;
};

// Picking a Workout for a new day and picking one for an already-added day
// both open the same WorkoutPicker — this tells handlePickWorkout which one
// the selection should apply to.
type PickerTarget = { kind: 'new' } | { kind: 'day'; dayId: string };

export function ProgramEditor({ programId }: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const router = useRouter();
  const {
    name,
    setName,
    description,
    setDescription,
    days,
    loading,
    saving,
    canSave,
    addDay,
    addWorkoutDay,
    removeDay,
    setDayWorkout,
    moveDay,
    save,
  } = useProgramEditor(programId);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  if (loading) {
    return <View className="flex-1 bg-background" />;
  }

  async function handleSave() {
    await save();
    router.back();
  }

  function handlePickWorkout(workout: ProgramDayWorkout) {
    if (pickerTarget?.kind === 'day') {
      setDayWorkout(pickerTarget.dayId, workout);
    } else if (pickerTarget?.kind === 'new') {
      addWorkoutDay(workout);
    }
    setPickerTarget(null);
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('programs.namePlaceholder')}
          placeholderTextColor={theme.textMuted}
          className="text-text text-xl font-semibold border-b border-surface-100 pb-2"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('programs.descriptionPlaceholder')}
          placeholderTextColor={theme.textMuted}
          multiline
          className="text-text mt-3 border-b border-surface-100 pb-2"
        />

        <Text className="text-textMuted text-sm mt-3">{t('programs.dayCount', { count: days.length })}</Text>

        <View className="mt-4">
          {days.length === 0 ? (
            <Text className="text-textMuted mt-4">{t('programs.noDays')}</Text>
          ) : (
            days.map((day, index) => (
              <View key={day.id} className="mt-4 rounded-lg bg-surface p-3">
                <View className="flex-row items-center gap-3">
                  <Text className="text-textMuted text-xs">{t('programs.dayLabel', { number: index + 1 })}</Text>
                  <Text className="text-text flex-1 font-medium">
                    {day.workout ? day.workout.name : t('programs.restDay')}
                  </Text>
                  <Pressable onPress={() => moveDay(day.id, -1)} hitSlop={8} disabled={index === 0}>
                    <FontAwesome6
                      name="chevron-up"
                      iconStyle="solid"
                      color={index === 0 ? theme.surface200 : theme.textMuted}
                      size={16}
                    />
                  </Pressable>
                  <Pressable onPress={() => moveDay(day.id, 1)} hitSlop={8} disabled={index === days.length - 1}>
                    <FontAwesome6
                      name="chevron-down"
                      iconStyle="solid"
                      color={index === days.length - 1 ? theme.surface200 : theme.textMuted}
                      size={16}
                    />
                  </Pressable>
                  <Pressable onPress={() => removeDay(day.id)} hitSlop={8}>
                    <FontAwesome6 name="trash" iconStyle="solid" color={theme.textMuted} size={16} />
                  </Pressable>
                </View>

                <View className="flex-row gap-4 mt-2">
                  <Pressable onPress={() => setPickerTarget({ kind: 'day', dayId: day.id })}>
                    <Text className="text-primary text-sm">
                      {day.workout ? t('programs.changeWorkout') : t('programs.assignWorkout')}
                    </Text>
                  </Pressable>
                  {day.workout ? (
                    <Pressable onPress={() => setDayWorkout(day.id, null)}>
                      <Text className="text-textMuted text-sm">{t('programs.markAsRest')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}

          <Pressable
            onPress={() => setPickerTarget({ kind: 'new' })}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-lg bg-surface-100 py-3"
          >
            <FontAwesome6 name="dumbbell" iconStyle="solid" color={theme.text} size={14} />
            <Text className="text-text">{t('programs.addWorkoutDay')}</Text>
          </Pressable>
          <Pressable
            onPress={addDay}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-lg bg-surface-100 py-3"
          >
            <FontAwesome6 name="bed" iconStyle="solid" color={theme.text} size={14} />
            <Text className="text-text">{t('programs.addRestDay')}</Text>
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

      <WorkoutPicker
        visible={pickerTarget !== null}
        language={language}
        onSelect={handlePickWorkout}
        onClose={() => setPickerTarget(null)}
      />
    </View>
  );
}
