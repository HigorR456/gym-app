import type { ScheduleDayInfo, ScheduleState } from '@/domain/schedule';
import type { ProgramDay } from '@/features/programs/types';

// UI-facing shape combining the persisted ScheduleState with the Program
// details needed to render it (name/icon/day-by-day workout references) —
// see spec/features/schedule.md.
export type ActiveSchedule = {
  id: string;
  programId: string;
  programName: string;
  programIcon: string;
  // In cycle position order — same shape ProgramEditor already works with.
  days: ProgramDay[];
  state: ScheduleState;
  // The day currently at the front of the cycle (pending/rest/planned) —
  // see domain/schedule/cycle.ts, describeCurrentDay.
  currentDay: ScheduleDayInfo;
};
