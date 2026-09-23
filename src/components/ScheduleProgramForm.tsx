import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { IconSwatch } from '@/components/IconSwatch';
import { Screen } from '@/components/Screen';
import { createSchedule } from '@/data/sqlite/repositories/scheduleRepository';
import { findAllProgramSummaries, findProgramById } from '@/data/sqlite/repositories/programRepository';
import type { Program, ProgramSummary } from '@/features/programs/types';
import { todayLocalDate } from '@/lib/date';
import { theme } from '@/lib/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Shared by the Schedule and Start screens — spec/features/start.md,
// "Choose Program": "the same schedule-creation component used on the
// Schedule screen... as a component shared between the two screens
// (ScheduleProgramForm)". Lives in src/components (not a feature folder)
// per spec/technical/architecture.md's component tree.
export function ScheduleProgramForm({ visible, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [startDayPosition, setStartDayPosition] = useState(0);
  const [startDate, setStartDate] = useState(todayLocalDate());
  const [continuous, setContinuous] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    findAllProgramSummaries(db).then(setPrograms);
  }, [visible, db]);

  async function handlePickProgram(summary: ProgramSummary) {
    const full = await findProgramById(db, summary.id);
    setSelectedProgram(full);
    setStartDayPosition(0);
  }

  function reset() {
    setSelectedProgram(null);
    setStartDayPosition(0);
    setStartDate(todayLocalDate());
    setContinuous(true);
    setEndDate('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const canSubmit =
    selectedProgram !== null &&
    DATE_PATTERN.test(startDate) &&
    (continuous || (DATE_PATTERN.test(endDate) && endDate >= startDate));

  async function handleSubmit() {
    if (!selectedProgram || !canSubmit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createSchedule(db, {
        programId: selectedProgram.id,
        startDate,
        startDayPosition,
        endDate: continuous ? null : endDate,
      });
      reset();
      onCreated();
    } catch {
      setError(t('schedule.activeScheduleExists'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <Screen className="flex-1 bg-background">
        <View className="flex-row items-center justify-end px-4 pb-2">
          <Pressable onPress={handleClose} hitSlop={12}>
            <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
          </Pressable>
        </View>

        {!selectedProgram ? (
          <FlatList
            data={programs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePickProgram(item)}
                className="flex-row items-center border-b border-surface-100 px-4 py-3"
              >
                <View className="mr-3">
                  <IconSwatch iconId={item.icon} variant="program" size={36} />
                </View>
                <View className="flex-1">
                  <Text className="text-text text-base">{item.name}</Text>
                  <Text className="text-textMuted text-sm mt-1">
                    {t('programs.dayCount', { count: item.dayCount })}
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={<EmptyState message={t('programs.empty')} compact />}
          />
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-8">
            <Pressable onPress={() => setSelectedProgram(null)} className="flex-row items-center gap-2 mb-4">
              <FontAwesome6 name="chevron-left" iconStyle="solid" color={theme.primary} size={14} />
              <Text className="text-primary">{selectedProgram.name}</Text>
            </Pressable>

            <Text className="text-textMuted text-sm mb-2">{t('schedule.startDayLabel')}</Text>
            {selectedProgram.days.map((day, index) => (
              <Pressable
                key={day.id}
                onPress={() => setStartDayPosition(index)}
                className={`flex-row items-center justify-between rounded-lg px-3 py-3 mb-2 ${
                  startDayPosition === index ? 'bg-surface-100' : ''
                }`}
              >
                <Text className="text-text">
                  {t('programs.dayLabel', { number: index + 1 })} —{' '}
                  {day.workout ? day.workout.name : t('programs.restDay')}
                </Text>
                {startDayPosition === index ? (
                  <FontAwesome6 name="check" iconStyle="solid" color={theme.primary} size={16} />
                ) : null}
              </Pressable>
            ))}

            <Text className="text-textMuted text-sm mt-4 mb-2">{t('schedule.startDateLabel')}</Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textMuted}
              className="text-text border-b border-surface-100 pb-2"
            />

            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-textMuted text-sm">{t('schedule.continuousLabel')}</Text>
              <Pressable
                onPress={() => setContinuous((prev) => !prev)}
                className={`rounded-full px-4 py-1 ${continuous ? 'bg-primary' : 'bg-surface-100'}`}
              >
                <Text className={continuous ? 'text-background font-semibold' : 'text-text'}>
                  {continuous ? t('common.yes') : t('common.no')}
                </Text>
              </Pressable>
            </View>

            {!continuous ? (
              <>
                <Text className="text-textMuted text-sm mt-4 mb-2">{t('schedule.endDateLabel')}</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                  className="text-text border-b border-surface-100 pb-2"
                />
              </>
            ) : null}

            {error ? <Text className="text-red-400 text-sm mt-4">{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || saving}
              className={`rounded-lg py-3 items-center mt-6 ${canSubmit && !saving ? 'bg-primary' : 'bg-surface-100'}`}
            >
              <Text className={canSubmit && !saving ? 'text-background font-semibold' : 'text-textMuted'}>
                {t('schedule.createAction')}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </Screen>
    </Modal>
  );
}
