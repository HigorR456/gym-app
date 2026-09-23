import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createScheduleState,
  describeCurrentDay,
  reconcileSchedule,
  skipCurrentDay,
  type HasCheckout,
  type ScheduleDayInfo,
  type ScheduleProgram,
  type ScheduleState,
} from '@/domain/schedule';
import type { ProgramDay } from '@/features/programs/types';
import type { ActiveSchedule } from '@/features/schedule/types';
import { toLocalDateString } from '@/lib/date';
import { nowIso } from '@/lib/datetime';
import { generateId } from '@/lib/id';

import { findProgramById } from './programRepository';

export type CreateScheduleInput = {
  programId: string;
  startDate: string;
  startDayPosition: number;
  endDate: string | null;
};

type ScheduledProgramRow = {
  id: string;
  program_id: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  start_day_position: number;
  current_cycle_position: number;
  pending_since_date: string;
};

function rowToState(row: ScheduledProgramRow): ScheduleState {
  return {
    status: row.status as ScheduleState['status'],
    startDate: row.start_date,
    startDayPosition: row.start_day_position,
    endDate: row.end_date,
    currentCyclePosition: row.current_cycle_position,
    pendingSinceDate: row.pending_since_date,
  };
}

function toScheduleProgram(days: ProgramDay[]): ScheduleProgram {
  return { days: days.map((day) => ({ position: day.position, type: day.workout ? 'workout' : 'rest' })) };
}

type RawActiveSchedule = { id: string; programId: string; state: ScheduleState };

async function findActiveScheduleRaw(db: SQLiteDatabase): Promise<RawActiveSchedule | null> {
  const row = await db.getFirstAsync<ScheduledProgramRow>(
    "SELECT * FROM scheduled_programs WHERE status = 'active' LIMIT 1",
  );
  // An active schedule's program_id is only ever null after its Program was
  // deleted, which requires archiving it first (see program repository) —
  // so a still-active row always has one, but the type is nullable at the
  // schema level (see migrations/0003_schedule_engine.ts).
  if (!row || !row.program_id) {
    return null;
  }
  return { id: row.id, programId: row.program_id, state: rowToState(row) };
}

// Every completed session tied to this schedule, as the local calendar date
// it was checked out on — the pure engine's HasCheckout lookup (see
// domain/schedule/types.ts) built from real data. Sessions aren't written
// by anything yet (Workout Execution is a later step), so this is normally
// empty for now; the engine already behaves correctly regardless.
async function buildHasCheckout(db: SQLiteDatabase, scheduledProgramId: string): Promise<HasCheckout> {
  const rows = await db.getAllAsync<{ ended_at: string }>(
    `SELECT ended_at FROM workout_sessions
     WHERE scheduled_program_id = ? AND status = 'completed' AND ended_at IS NOT NULL`,
    scheduledProgramId,
  );
  const checkedOutDates = new Set(rows.map((row) => toLocalDateString(new Date(row.ended_at))));
  return (date: string) => checkedOutDates.has(date);
}

async function persistState(db: SQLiteDatabase, id: string, state: ScheduleState): Promise<void> {
  await db.runAsync(
    `UPDATE scheduled_programs
     SET current_cycle_position = ?, pending_since_date = ?, updated_at = ?
     WHERE id = ?`,
    state.currentCyclePosition,
    state.pendingSinceDate,
    nowIso(),
    id,
  );
}

export async function findActiveSchedule(db: SQLiteDatabase, today: string): Promise<ActiveSchedule | null> {
  const raw = await findActiveScheduleRaw(db);
  if (!raw) {
    return null;
  }
  const program = await findProgramById(db, raw.programId);
  if (!program) {
    return null;
  }
  const currentDay = describeCurrentDay(raw.state, toScheduleProgram(program.days), today);
  return {
    id: raw.id,
    programId: program.id,
    programName: program.name,
    programIcon: program.icon,
    days: program.days,
    state: raw.state,
    currentDay,
  };
}

export async function findActiveScheduleForProgram(db: SQLiteDatabase, programId: string): Promise<{ id: string } | null> {
  const row = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM scheduled_programs WHERE status = 'active' AND program_id = ?",
    programId,
  );
  return row ?? null;
}

// Run on app open/resume (spec/technical/architecture.md, "App bootstrap")
// and after logging a checkout — walks the active schedule forward and
// persists the result if anything actually resolved.
export async function reconcileActiveSchedule(db: SQLiteDatabase, today: string): Promise<void> {
  const raw = await findActiveScheduleRaw(db);
  if (!raw) {
    return;
  }
  const program = await findProgramById(db, raw.programId);
  if (!program) {
    return;
  }
  const hasCheckout = await buildHasCheckout(db, raw.id);
  const { state } = reconcileSchedule(raw.state, toScheduleProgram(program.days), today, hasCheckout);
  if (state.currentCyclePosition !== raw.state.currentCyclePosition || state.pendingSinceDate !== raw.state.pendingSinceDate) {
    await persistState(db, raw.id, state);
  }
}

// "Manually skipping a day" (spec/features/schedule.md) — throws if there's
// no active schedule or its current day isn't a pending workout (see
// domain/schedule/cycle.ts, skipCurrentDay), which the UI should prevent by
// only showing the Skip action when it applies.
export async function skipActiveScheduleDay(db: SQLiteDatabase, today: string): Promise<void> {
  const raw = await findActiveScheduleRaw(db);
  if (!raw) {
    throw new Error('No active schedule');
  }
  const program = await findProgramById(db, raw.programId);
  if (!program) {
    throw new Error(`Program not found: ${raw.programId}`);
  }
  const hasCheckout = await buildHasCheckout(db, raw.id);
  const { state } = skipCurrentDay(raw.state, toScheduleProgram(program.days), today, hasCheckout);
  await persistState(db, raw.id, state);
}

// "Only one active schedule" (spec/features/schedule.md) — throws instead
// of silently replacing one, so the UI can show the required blocking
// warning instead of a surprising side effect.
export async function createSchedule(db: SQLiteDatabase, input: CreateScheduleInput): Promise<string> {
  const existing = await findActiveScheduleRaw(db);
  if (existing) {
    throw new Error('An active schedule already exists');
  }

  const id = generateId();
  const timestamp = nowIso();
  const state = createScheduleState({
    startDate: input.startDate,
    startDayPosition: input.startDayPosition,
    endDate: input.endDate,
  });

  await db.runAsync(
    `INSERT INTO scheduled_programs
       (id, program_id, status, start_date, end_date, start_day_position, current_cycle_position, pending_since_date, created_at, updated_at)
     VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.programId,
    state.startDate,
    state.endDate,
    state.startDayPosition,
    state.currentCyclePosition,
    state.pendingSinceDate,
    timestamp,
    timestamp,
  );

  return id;
}

// Editing the end date (spec/features/schedule.md, item 9) — setting it to
// a past date is one of the three ways a schedule ends (see "Only one
// active schedule"), so this also archives the row when that happens,
// instead of leaving a schedule whose coverage already ended still
// occupying the single active slot.
export async function updateScheduleEndDate(
  db: SQLiteDatabase,
  id: string,
  endDate: string | null,
  today: string,
): Promise<void> {
  const shouldArchive = endDate !== null && endDate < today;
  await db.runAsync(
    'UPDATE scheduled_programs SET end_date = ?, status = ?, updated_at = ? WHERE id = ?',
    endDate,
    shouldArchive ? 'archived' : 'active',
    nowIso(),
    id,
  );
}

// "Delete the current schedule at any time" (spec/features/schedule.md) —
// archives rather than hard-deletes, since past schedules must keep
// existing for their session history to stay attributable (see "Only one
// active schedule": "it never erases history").
export async function endSchedule(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("UPDATE scheduled_programs SET status = 'archived', updated_at = ? WHERE id = ?", nowIso(), id);
}

// spec/features/program.md, "Changing the number of days of a Program with
// an active schedule recalculates the current cycle position... modulo the
// new day count". Called by ProgramEditor after a structural save, only
// when an active schedule references the edited Program.
export async function realignScheduleToNewDayCount(db: SQLiteDatabase, scheduleId: string, newDayCount: number): Promise<void> {
  const row = await db.getFirstAsync<{ current_cycle_position: number }>(
    'SELECT current_cycle_position FROM scheduled_programs WHERE id = ?',
    scheduleId,
  );
  if (!row) {
    return;
  }
  const realigned = row.current_cycle_position % newDayCount;
  await db.runAsync(
    'UPDATE scheduled_programs SET current_cycle_position = ?, updated_at = ? WHERE id = ?',
    realigned,
    nowIso(),
    scheduleId,
  );
}

// The full historical resolution log for the active schedule, from its
// start_date through wherever it's currently resolved (spec/features/
// schedule.md, "States": history must be preserved even as the cycle
// slides). Re-walks from a fresh copy of the state anchored at start_date —
// read-only, never persisted — since ScheduleState itself only remembers
// the current pointer (see domain/schedule/cycle.ts, reconcileSchedule).
// Used by the calendar to classify past dates (rest/completed/skipped).
export async function computeScheduleHistory(db: SQLiteDatabase, today: string): Promise<ScheduleDayInfo[]> {
  const raw = await findActiveScheduleRaw(db);
  if (!raw) {
    return [];
  }
  const program = await findProgramById(db, raw.programId);
  if (!program) {
    return [];
  }
  const hasCheckout = await buildHasCheckout(db, raw.id);
  const freshState = createScheduleState({
    startDate: raw.state.startDate,
    startDayPosition: raw.state.startDayPosition,
    endDate: raw.state.endDate,
  });
  const { resolvedDays } = reconcileSchedule(freshState, toScheduleProgram(program.days), today, hasCheckout);
  return resolvedDays;
}

// Real completed-session counts per local date, for the calendar heatmap
// (spec/features/schedule.md, "Calendar heatmap") — independent of the
// active schedule's plan, so this covers a plain date range regardless of
// whether there's an active schedule at all.
export async function findSessionCountsByDate(
  db: SQLiteDatabase,
  fromDate: string,
  toDate: string,
): Promise<Map<string, number>> {
  const rows = await db.getAllAsync<{ ended_at: string }>(
    `SELECT ended_at FROM workout_sessions WHERE status = 'completed' AND ended_at IS NOT NULL`,
  );
  const counts = new Map<string, number>();
  for (const row of rows) {
    const date = toLocalDateString(new Date(row.ended_at));
    if (date < fromDate || date > toDate) {
      continue;
    }
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return counts;
}
