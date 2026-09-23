import { addDaysToLocalDate, daysBetweenLocalDates } from '@/lib/date';

import type {
  HasCheckout,
  ReconcileResult,
  ScheduleDayInfo,
  ScheduleProgram,
  ScheduleState,
} from './types';

// Creates the initial state for a brand-new schedule (spec/features/
// schedule.md, items 1-4: Program, cycle starting day, start date, end
// date). Nothing has resolved yet, so the pending day is the start day
// itself, dated on the start date.
export function createScheduleState(input: {
  startDate: string;
  startDayPosition: number;
  endDate: string | null;
}): ScheduleState {
  return {
    status: 'active',
    startDate: input.startDate,
    startDayPosition: input.startDayPosition,
    endDate: input.endDate,
    currentCyclePosition: input.startDayPosition,
    pendingSinceDate: input.startDate,
  };
}

function nextPosition(position: number, cycleLength: number): number {
  return (position + 1) % cycleLength;
}

function dayTypeAt(program: ScheduleProgram, position: number) {
  return program.days[position].type;
}

// Walks the schedule forward from its current pending day up to `today`,
// resolving whatever can be resolved:
//  - an elapsed rest day (date < today) auto-completes and advances —
//    "rest days... automatically skipped... once the rest day's date
//    passes" (spec/features/schedule.md, "Cycle model").
//  - a workout day advances only once `hasCheckout` confirms it — otherwise
//    the walk stops right there, leaving it pending/overdue. This is the
//    entire mechanism behind the cumulative slide: nothing after an
//    unresolved workout day can be dated yet, so the walk simply can't
//    proceed past it (spec/features/schedule.md, "Automatic reschedule on
//    missed checkout").
// Call this on app open/resume (spec/technical/architecture.md, "App
// bootstrap") and after logging a checkout, to keep state current.
export function reconcileSchedule(
  state: ScheduleState,
  program: ScheduleProgram,
  today: string,
  hasCheckout: HasCheckout,
): ReconcileResult {
  let position = state.currentCyclePosition;
  let date = state.pendingSinceDate;
  const resolvedDays: ScheduleDayInfo[] = [];
  const cycleLength = program.days.length;

  while (date <= today && (state.endDate === null || date <= state.endDate)) {
    const type = dayTypeAt(program, position);

    if (type === 'rest') {
      if (date >= today) {
        break;
      }
      resolvedDays.push({ date, position, type, state: 'rest', overdue: false });
    } else {
      if (!hasCheckout(date)) {
        break;
      }
      resolvedDays.push({ date, position, type, state: 'completed', overdue: false });
    }

    position = nextPosition(position, cycleLength);
    date = addDaysToLocalDate(date, 1);
  }

  return {
    state: { ...state, currentCyclePosition: position, pendingSinceDate: date },
    resolvedDays,
  };
}

// Describes the day currently at the front of the cycle — never
// 'completed'/'skipped' (those only ever appear in reconcileSchedule's
// resolvedDays history; once a day resolves, it stops being "current").
// Assumes `state` was already reconciled as of `today` via
// reconcileSchedule — this only reads it, it doesn't re-walk anything.
export function describeCurrentDay(state: ScheduleState, program: ScheduleProgram, today: string): ScheduleDayInfo {
  const { currentCyclePosition: position, pendingSinceDate: date } = state;
  const type = dayTypeAt(program, position);

  if (type === 'rest') {
    return { date, position, type, state: 'rest', overdue: false };
  }
  if (date > today) {
    return { date, position, type, state: 'planned', overdue: false };
  }
  return { date, position, type, state: 'pending', overdue: date < today };
}

// "Manually skipping a day" (spec/features/schedule.md) — only the
// currently pending *workout* day can be skipped; rest days already
// resolve on their own and have no skip action. Records that day with the
// 'skipped' state (distinct from a day merely left unresolved), then
// advances and continues reconciling in case that immediately exposes an
// already-elapsed rest day or an already-checked-out workout day.
export function skipCurrentDay(
  state: ScheduleState,
  program: ScheduleProgram,
  today: string,
  hasCheckout: HasCheckout,
): ReconcileResult {
  const { currentCyclePosition: position, pendingSinceDate: date } = state;
  const type = dayTypeAt(program, position);
  if (type !== 'workout') {
    throw new Error('Only a pending workout day can be skipped');
  }

  const skippedDay: ScheduleDayInfo = { date, position, type, state: 'skipped', overdue: false };
  const advanced: ScheduleState = {
    ...state,
    currentCyclePosition: nextPosition(position, program.days.length),
    pendingSinceDate: addDaysToLocalDate(date, 1),
  };

  const { state: reconciledState, resolvedDays } = reconcileSchedule(advanced, program, today, hasCheckout);
  return { state: reconciledState, resolvedDays: [skippedDay, ...resolvedDays] };
}

// Optimistic projection for a date at/after the current pending day — the
// only way to guess a future date's position before it's actually reached
// is to assume no further missed checkouts between now and then (see
// reconcileSchedule's doc comment on why that's unknowable otherwise).
// Used for rendering "planned future coverage" (spec/features/schedule.md,
// item 5 and the calendar heatmap's future-coverage outline), never for
// state mutation.
export function projectDay(state: ScheduleState, program: ScheduleProgram, date: string): ScheduleDayInfo | null {
  if (date < state.pendingSinceDate || date < state.startDate) {
    return null;
  }
  if (state.endDate !== null && date > state.endDate) {
    return null;
  }
  const daysAhead = daysBetweenLocalDates(state.pendingSinceDate, date);
  const position = nextPositionAfter(state.currentCyclePosition, daysAhead, program.days.length);
  const type = dayTypeAt(program, position);
  return { date, position, type, state: 'planned', overdue: false };
}

function nextPositionAfter(position: number, steps: number, cycleLength: number): number {
  return (position + steps) % cycleLength;
}
