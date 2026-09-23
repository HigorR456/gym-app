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
import { theme } from '@/lib/theme';

import { usePrograms } from '../hooks/usePrograms';
import { DuplicateProgramModal } from './DuplicateProgramModal';

export function ProgramList() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useSQLiteContext();
  const { programs, loading, refetch } = usePrograms();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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

  async function handleConfirmDelete() {
    if (!pendingDeleteId) {
      return;
    }
    await deleteProgram(db, pendingDeleteId);
    setPendingDeleteId(null);
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
              onDelete={() => setPendingDeleteId(item.id)}
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
        visible={pendingDeleteId !== null}
        title={t('programs.deleteTitle')}
        message={t('programs.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Screen>
  );
}
