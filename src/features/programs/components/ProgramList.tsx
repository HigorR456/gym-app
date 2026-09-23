import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { WorkoutCard } from '@/components/WorkoutCard';
import {
  deleteProgram,
  duplicateProgram,
  duplicateProgramWithWorkouts,
} from '@/data/sqlite/repositories/programRepository';
import { findActiveScheduleForProgram } from '@/data/sqlite/repositories/scheduleRepository';
import { theme } from '@/lib/theme';

import { usePrograms } from '../hooks/usePrograms';
import { DuplicateProgramModal } from './DuplicateProgramModal';

type PendingDelete = { id: string; message: string };

export function ProgramList() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useSQLiteContext();
  const { programs, loading, refetch } = usePrograms();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<{ id: string; name: string } | null>(null);

  async function handleDuplicate() {
    if (!duplicateTarget) {
      return;
    }
    await duplicateProgram(db, duplicateTarget.id, `${duplicateTarget.name} (${t('programs.copySuffix')})`);
    setDuplicateTarget(null);
    await refetch();
  }

  async function handleDuplicateWithWorkouts() {
    if (!duplicateTarget) {
      return;
    }
    await duplicateProgramWithWorkouts(
      db,
      duplicateTarget.id,
      `${duplicateTarget.name} (${t('programs.copySuffix')})`,
    );
    setDuplicateTarget(null);
    await refetch();
  }

  // spec/features/program.md, "Editing/deleting a Program with an active
  // schedule": always warn when one is linked — deleteProgram() itself
  // archives that schedule before deleting the Program.
  async function handleRequestDelete(id: string) {
    const activeSchedule = await findActiveScheduleForProgram(db, id);
    const message = activeSchedule ? t('programs.deleteActiveScheduleMessage') : t('programs.deleteMessage');
    setPendingDelete({ id, message });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    await deleteProgram(db, pendingDelete.id);
    setPendingDelete(null);
    await refetch();
  }

  return (
    <Screen className="flex-1 bg-background">
      <View className="flex-row items-center justify-end px-4 pt-4 pb-2">
        <Pressable
          onPress={() => router.push('/program/new')}
          className="flex-row items-center gap-2 rounded-lg bg-primary px-3 py-2"
        >
          <FontAwesome6 name="plus" iconStyle="solid" color={theme.background} size={14} />
        </Pressable>
      </View>

      {!loading && programs.length === 0 ? (
        <EmptyState message={t('programs.empty')} />
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(program) => program.id}
          renderItem={({ item }) => (
            <WorkoutCard
              name={item.name}
              subtitle={t('programs.dayCount', { count: item.dayCount })}
              iconId={item.icon}
              iconVariant="program"
              onPress={() => router.push(`/program/${item.id}`)}
              onDuplicate={() => setDuplicateTarget({ id: item.id, name: item.name })}
              onDelete={() => void handleRequestDelete(item.id)}
            />
          )}
        />
      )}

      <DuplicateProgramModal
        visible={duplicateTarget !== null}
        onDuplicate={handleDuplicate}
        onDuplicateWithWorkouts={handleDuplicateWithWorkouts}
        onCancel={() => setDuplicateTarget(null)}
      />

      <ConfirmationModal
        visible={pendingDelete !== null}
        title={t('programs.deleteTitle')}
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
