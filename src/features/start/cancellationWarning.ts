import type { ActiveSchedule } from '@/features/schedule/types';

// spec/features/start.md, "Starting a workout while a schedule is active":
// warn only when picking something other than what the schedule has
// planned for today — a different Workout on a workout day, or training at
// all on a rest day. Once today's day is already resolved (currentDay is
// 'planned', meaning it now points at a future day), or there's no active
// schedule, there's nothing left to lose and no warning applies (see
// "Multiple sessions on the same day").
export function requiresCancellationWarning(schedule: ActiveSchedule | null, workoutId: string): boolean {
  if (!schedule) {
    return false;
  }
  const { currentDay } = schedule;
  if (currentDay.state === 'planned') {
    return false;
  }
  if (currentDay.type === 'rest') {
    return true;
  }
  const day = schedule.days.find((d) => d.position === currentDay.position);
  return day?.workout?.id !== workoutId;
}
