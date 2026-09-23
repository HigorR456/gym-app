import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSQLiteContext } from 'expo-sqlite';
import { FlatList, Pressable, View } from 'react-native';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { WorkoutCard } from '@/components/WorkoutCard';
import {
  deleteWorkout,
  duplicateWorkout,
  findProgramsReferencingWorkout,
} from '@/data/sqlite/repositories/workoutRepository';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { theme } from '@/lib/theme';

import { useWorkouts } from '../hooks/useWorkouts';

type PendingDelete = { id: string; message: string };

export function WorkoutList() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const router = useRouter();
  const db = useSQLiteContext();
  const { workouts, loading, refetch } = useWorkouts();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  async function handleDuplicate(id: string, name: string) {
    await duplicateWorkout(db, id, `${name} (${t('workouts.newWorkout')})`);
    await refetch();
  }

  // spec/features/workout.md, "Deleting a Workout referenced by Programs":
  // list which Programs use it, and warn explicitly if any has an active
  // schedule — deleteWorkout() itself turns those days into Rest Days.
  async function handleRequestDelete(id: string) {
    const references = await findProgramsReferencingWorkout(db, id);
    if (references.length === 0) {
      setPendingDelete({ id, message: t('workouts.deleteMessage') });
      return;
    }
    const programNames = references.map((reference) => reference.programName).join(', ');
    const hasActiveSchedule = references.some((reference) => reference.hasActiveSchedule);
    const message = hasActiveSchedule
      ? t('workouts.deleteReferencedActiveScheduleMessage', { programs: programNames })
      : t('workouts.deleteReferencedMessage', { programs: programNames });
    setPendingDelete({ id, message });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    await deleteWorkout(db, pendingDelete.id);
    setPendingDelete(null);
    await refetch();
  }

  return (
    <Screen className="flex-1 bg-background">
      <View className="flex-row items-center justify-end px-4 pt-4 pb-2">
        <Pressable
          onPress={() => router.push('/workout/new')}
          className="flex-row items-center gap-2 rounded-lg bg-primary px-3 py-2"
        >
          <FontAwesome6 name="plus" iconStyle="solid" color={theme.background} size={14} />
        </Pressable>
      </View>

      {!loading && workouts.length === 0 ? (
        <EmptyState message={t('workouts.empty')} />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(workout) => workout.id}
          renderItem={({ item }) => (
            <WorkoutCard
              name={item.name}
              description={
                item.exerciseNames.length > 0
                  ? item.exerciseNames.map((exerciseName) => pickLocalized(exerciseName, language)).join(', ')
                  : undefined
              }
              subtitle={t('workouts.exerciseCount', { count: item.exerciseCount })}
              iconId={item.icon}
              iconVariant="workout"
              onPress={() => router.push(`/workout/${item.id}`)}
              onDuplicate={() => handleDuplicate(item.id, item.name)}
              onDelete={() => void handleRequestDelete(item.id)}
            />
          )}
        />
      )}

      <ConfirmationModal
        visible={pendingDelete !== null}
        title={t('workouts.deleteTitle')}
        message={pendingDelete?.message}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
