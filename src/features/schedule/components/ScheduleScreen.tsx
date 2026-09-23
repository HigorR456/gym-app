import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { IconSwatch } from '@/components/IconSwatch';
import { Screen } from '@/components/Screen';
import {
  endSchedule,
  skipActiveScheduleDay,
  updateScheduleEndDate,
} from '@/data/sqlite/repositories/scheduleRepository';
import { todayLocalDate } from '@/lib/date';
import { theme } from '@/lib/theme';

import { useActiveSchedule } from '../hooks/useActiveSchedule';
import type { ActiveSchedule } from '../types';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleProgramForm } from './ScheduleProgramForm';

export function ScheduleScreen() {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const { schedule, loading, refetch } = useActiveSchedule();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [endDateDraft, setEndDateDraft] = useState('');
  const [continuousDraft, setContinuousDraft] = useState(true);

  if (loading) {
    return <View className="flex-1 bg-background" />;
  }

  async function handleSkip() {
    await skipActiveScheduleDay(db, todayLocalDate());
    await refetch();
  }

  async function handleDelete() {
    if (!schedule) {
      return;
    }
    await endSchedule(db, schedule.id);
    setConfirmDelete(false);
    await refetch();
  }

  function openEndDateEditor() {
    if (!schedule) {
      return;
    }
    setContinuousDraft(schedule.state.endDate === null);
    setEndDateDraft(schedule.state.endDate ?? '');
    setEditingEndDate(true);
  }

  async function handleSaveEndDate() {
    if (!schedule) {
      return;
    }
    await updateScheduleEndDate(db, schedule.id, continuousDraft ? null : endDateDraft, todayLocalDate());
    setEditingEndDate(false);
    await refetch();
  }

  return (
    <Screen className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        <Text className="text-text text-xl font-semibold mb-4">{t('tabs.schedule')}</Text>

        {!schedule ? (
          <>
            <Text className="text-textMuted mb-4">{t('schedule.empty')}</Text>
            <Pressable onPress={() => setFormOpen(true)} className="rounded-lg bg-primary py-3 items-center">
              <Text className="text-background font-semibold">{t('schedule.chooseProgram')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-3 mb-4">
              <IconSwatch iconId={schedule.programIcon} variant="program" size={40} />
              <Text className="text-text text-lg font-semibold flex-1">{schedule.programName}</Text>
            </View>

            <CurrentDayCard schedule={schedule} onSkip={handleSkip} />

            <View className="mt-6">
              <ScheduleCalendar schedule={schedule} />
            </View>

            <View className="flex-row gap-6 mt-6">
              <Pressable onPress={openEndDateEditor}>
                <Text className="text-primary text-sm">{t('schedule.changeEndDate')}</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmDelete(true)}>
                <Text className="text-textMuted text-sm">{t('schedule.deleteSchedule')}</Text>
              </Pressable>
            </View>

            {editingEndDate ? (
              <View className="mt-4 rounded-lg bg-surface p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-textMuted text-sm">{t('schedule.continuousLabel')}</Text>
                  <Pressable
                    onPress={() => setContinuousDraft((prev) => !prev)}
                    className={`rounded-full px-4 py-1 ${continuousDraft ? 'bg-primary' : 'bg-surface-100'}`}
                  >
                    <Text className={continuousDraft ? 'text-background font-semibold' : 'text-text'}>
                      {continuousDraft ? t('common.yes') : t('common.no')}
                    </Text>
                  </Pressable>
                </View>
                {!continuousDraft ? (
                  <TextInput
                    value={endDateDraft}
                    onChangeText={setEndDateDraft}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.textMuted}
                    className="text-text border-b border-surface-100 pb-2 mt-3"
                  />
                ) : null}
                <Pressable onPress={handleSaveEndDate} className="rounded-lg bg-primary py-2 items-center mt-3">
                  <Text className="text-background font-semibold">{t('common.save')}</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <ScheduleProgramForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={() => {
          setFormOpen(false);
          void refetch();
        }}
      />

      <ConfirmationModal
        visible={confirmDelete}
        title={t('schedule.deleteTitle')}
        message={t('schedule.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

function CurrentDayCard({ schedule, onSkip }: { schedule: ActiveSchedule; onSkip: () => void }) {
  const { t } = useTranslation();
  const { currentDay, days } = schedule;
  const day = days.find((d) => d.position === currentDay.position);
  const title = currentDay.type === 'rest' ? t('programs.restDay') : (day?.workout?.name ?? '');
  const statusLabel =
    currentDay.type === 'rest'
      ? t('schedule.restDayToday')
      : currentDay.state === 'planned'
        ? t('schedule.plannedWorkout')
        : currentDay.overdue
          ? t('schedule.overdueWorkout')
          : t('schedule.pendingWorkout');

  return (
    <View className="rounded-lg bg-surface p-4">
      <Text className="text-textMuted text-xs">{t('programs.dayLabel', { number: currentDay.position + 1 })}</Text>
      <Text className="text-text text-base font-medium mt-1">{title}</Text>
      <Text className="text-textMuted text-sm mt-1">{statusLabel}</Text>
      {currentDay.type === 'workout' && currentDay.state === 'pending' ? (
        <Pressable onPress={onSkip} className="mt-3 self-start">
          <Text className="text-primary text-sm">{t('schedule.skipDay')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
