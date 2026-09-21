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
import { deleteWorkout, duplicateWorkout } from '@/data/sqlite/repositories/workoutRepository';
import { theme } from '@/lib/theme';

import { useWorkouts } from '../hooks/useWorkouts';

export function WorkoutList() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useSQLiteContext();
  const { workouts, loading, refetch } = useWorkouts();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDuplicate(id: string, name: string) {
    await duplicateWorkout(db, id, `${name} (${t('workouts.newWorkout')})`);
    await refetch();
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) {
      return;
    }
    await deleteWorkout(db, pendingDeleteId);
    setPendingDeleteId(null);
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
              subtitle={t('workouts.exerciseCount', { count: item.exerciseCount })}
              onPress={() => router.push(`/workout/${item.id}`)}
              onDuplicate={() => handleDuplicate(item.id, item.name)}
              onDelete={() => setPendingDeleteId(item.id)}
            />
          )}
        />
      )}

      <ConfirmationModal
        visible={pendingDeleteId !== null}
        title={t('workouts.deleteTitle')}
        message={t('workouts.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Screen>
  );
}
