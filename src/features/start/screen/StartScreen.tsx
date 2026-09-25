import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { CurrentDayCard } from '@/components/CurrentDayCard';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScheduleProgramForm } from '@/components/ScheduleProgramForm';
import { WorkoutCard } from '@/components/WorkoutCard';
import { endSchedule, skipActiveScheduleDay } from '@/data/sqlite/repositories/scheduleRepository';
import { startSession } from '@/data/sqlite/repositories/sessionRepository';
import { useActiveSchedule } from '@/features/schedule/hooks/useActiveSchedule';
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts';
import type { WorkoutSummary } from '@/features/workouts/types';
import { todayLocalDate } from '@/lib/date';

import { requiresCancellationWarning } from '../cancellationWarning';

// spec/features/start.md — the entry point for starting a workout, either
// via the active schedule's current day or any Workout directly.
export function StartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useSQLiteContext();
  const { schedule, loading: scheduleLoading, refetch: refetchSchedule } = useActiveSchedule();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const [formOpen, setFormOpen] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<WorkoutSummary | null>(null);

  async function handleSkip() {
    await skipActiveScheduleDay(db, todayLocalDate());
    await refetchSchedule();
  }

  // programId/scheduledProgramId determine whether finishing this session
  // updates the Schedule (spec/features/workout-execution.md, "Finishing
  // the workout") — see sessionRepository.startSession's doc comment.
  async function startWorkout(workoutId: string, programId: string | null, scheduledProgramId: string | null) {
    const sessionId = await startSession(db, { workoutId, programId, scheduledProgramId });
    router.push(`/session/${sessionId}`);
  }

  // "Start via Program: Start → Program → Today's Workout → Exercises"
  // (spec/features/start.md) — tapping the current day card when it's a
  // pending workout day starts it directly, no warning (it's exactly what
  // the schedule already has planned).
  async function handleStartScheduled() {
    if (!schedule || schedule.currentDay.type !== 'workout') {
      return;
    }
    const day = schedule.days.find((d) => d.position === schedule.currentDay.position);
    if (!day?.workout) {
      return;
    }
    await startWorkout(day.workout.id, schedule.programId, schedule.id);
  }

  // spec/features/start.md, "Starting a workout while a schedule is
  // active": warn before starting anything other than today's scheduled
  // day; cancelling the schedule on confirm has the same effect as
  // deleting it (see spec/features/schedule.md, "Only one active schedule").
  function handleSelectWorkout(workout: WorkoutSummary) {
    if (requiresCancellationWarning(schedule, workout.id)) {
      setPendingWorkout(workout);
      return;
    }
    // A direct pick that happens to match today's pending workout still
    // updates the Schedule once finished, but isn't "via Program" (see
    // sessionRepository.startSession) — only tag scheduledProgramId.
    const matchesPendingDay = schedule?.currentDay.type === 'workout' && schedule.currentDay.state === 'pending';
    void startWorkout(workout.id, null, matchesPendingDay ? (schedule?.id ?? null) : null);
  }

  async function handleConfirmCancelSchedule() {
    if (!schedule || !pendingWorkout) {
      return;
    }
    await endSchedule(db, schedule.id);
    const workoutId = pendingWorkout.id;
    setPendingWorkout(null);
    await refetchSchedule();
    await startWorkout(workoutId, null, null);
  }

  if (scheduleLoading) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <Screen className="flex-1 bg-background">
      <FlatList
        data={workouts}
        keyExtractor={(workout) => workout.id}
        contentContainerClassName="pb-8"
        ListHeaderComponent={
          <View className="px-4 pt-4 pb-2">
            <Text className="text-text text-xl font-semibold mb-4">{t('tabs.start')}</Text>

            {schedule ? (
              <CurrentDayCard schedule={schedule} onSkip={handleSkip} onStart={() => void handleStartScheduled()} />
            ) : (
              <>
                <Text className="text-textMuted mb-4">{t('start.noSchedule')}</Text>
                <Pressable onPress={() => setFormOpen(true)} className="rounded-lg bg-primary py-3 items-center mb-2">
                  <Text className="text-background font-semibold">{t('start.chooseProgram')}</Text>
                </Pressable>
              </>
            )}

            {!workoutsLoading && workouts.length > 0 ? (
              <Text className="text-textMuted text-sm mt-6">{t('start.workoutsHeading')}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={!workoutsLoading ? <EmptyState message={t('workouts.empty')} /> : null}
        renderItem={({ item }) => (
          <WorkoutCard
            name={item.name}
            subtitle={t('workouts.exerciseCount', { count: item.exerciseCount })}
            iconId={item.icon}
            iconVariant="workout"
            onPress={() => handleSelectWorkout(item)}
          />
        )}
      />

      <ScheduleProgramForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={() => {
          setFormOpen(false);
          void refetchSchedule();
        }}
      />

      <ConfirmationModal
        visible={pendingWorkout !== null}
        title={t('start.cancelScheduleTitle')}
        message={t('start.cancelScheduleMessage')}
        confirmLabel={t('start.cancelScheduleConfirm')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleConfirmCancelSchedule}
        onCancel={() => setPendingWorkout(null)}
      />
    </Screen>
  );
}
