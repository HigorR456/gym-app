// Domain types for the scheduling engine — see spec/features/schedule.md.
// Pure, I/O-free by design (see spec/technical/architecture.md, "Domain
// layer: pure functions first"): state + current time in, new state out.

export type ProgramDayType = 'workout' | 'rest';

export type ScheduleProgramDay = {
  position: number;
  type: ProgramDayType;
};

// The slice of a Program the engine actually needs — day types in cycle
// order. Everything else (Workout details, names, icons) is a UI concern
// (see spec/features/program.md).
export type ScheduleProgram = {
  days: ScheduleProgramDay[];
};

export type ScheduleStatus = 'active' | 'archived';

// Mirrors scheduled_programs (see spec/technical/database-schema.md), using
// local calendar dates (YYYY-MM-DD strings — see lib/date.ts) throughout,
// per spec/features/schedule.md, "Definition of day".
export type ScheduleState = {
  status: ScheduleStatus;
  startDate: string;
  startDayPosition: number;
  // Inclusive last covered date; null = continuous/infinite program.
  endDate: string | null;
  currentCyclePosition: number;
  // The calendar date the day at currentCyclePosition became the pending
  // one — i.e. the last time the pointer advanced (or startDate, before
  // anything has advanced yet). This is what makes the cumulative slide
  // from a missed checkout possible (spec/features/schedule.md, "Automatic
  // reschedule on missed checkout"): the pointer simply doesn't advance
  // until resolved, so every date from here to now maps to this same day,
  // increasingly overdue, instead of a fixed start_date + N*position
  // formula. Not yet a column in database-schema.md's scheduled_programs —
  // needs to be added alongside current_cycle_position when the repository
  // for this is built (step 11).
  pendingSinceDate: string;
};

export type ScheduleDayState = 'planned' | 'pending' | 'completed' | 'skipped' | 'rest';

export type ScheduleDayInfo = {
  date: string;
  position: number;
  type: ProgramDayType;
  state: ScheduleDayState;
  // Only meaningful when state === 'pending' — a workout day whose date has
  // fully passed without a checkout (spec/features/schedule.md, "States").
  overdue: boolean;
};

export type ReconcileResult = {
  state: ScheduleState;
  // Newly resolved days since the previous pendingSinceDate, oldest first —
  // preserves the history of what happened even though ScheduleState itself
  // only ever remembers the current pointer (spec/features/schedule.md,
  // "States": "must always preserve the history... even when the cycle
  // slides").
  resolvedDays: ScheduleDayInfo[];
};

// A pure lookup the engine needs but doesn't own: whether the scheduled
// Workout for this schedule was checked out (finished) on this date. The
// repository layer builds this from workout_sessions (see
// spec/technical/database-schema.md) — the engine itself does no I/O.
export type HasCheckout = (date: string) => boolean;
