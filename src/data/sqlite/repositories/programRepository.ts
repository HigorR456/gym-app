import type { SQLiteDatabase } from 'expo-sqlite';

import type { Program, ProgramDay, ProgramSummary } from '@/features/programs/types';
import { nowIso } from '@/lib/datetime';
import { generateId } from '@/lib/id';

import { duplicateWorkout } from './workoutRepository';

export type ProgramDayInput = {
  // null = rest day (see features/programs/types.ts).
  workoutId: string | null;
};

export type ProgramInput = {
  name: string;
  description: string | null;
  days: ProgramDayInput[];
};

export async function findAllProgramSummaries(db: SQLiteDatabase): Promise<ProgramSummary[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    updated_at: string;
    day_count: number;
  }>(
    `SELECT p.id, p.name, p.updated_at, COUNT(pd.id) as day_count
     FROM programs p
     LEFT JOIN program_days pd ON pd.program_id = p.id
     GROUP BY p.id
     ORDER BY p.updated_at DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    dayCount: row.day_count,
    updatedAt: row.updated_at,
  }));
}

type ProgramDayRow = {
  id: string;
  position: number;
  workout_id: string | null;
  workout_name: string | null;
};

export async function findProgramById(db: SQLiteDatabase, id: string): Promise<Program | null> {
  const programRow = await db.getFirstAsync<{
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>('SELECT id, name, description, created_at, updated_at FROM programs WHERE id = ?', id);
  if (!programRow) {
    return null;
  }

  // LEFT JOIN so a rest day (workout_id null) still shows up.
  const rows = await db.getAllAsync<ProgramDayRow>(
    `SELECT pd.id, pd.position, pd.workout_id, w.name as workout_name
     FROM program_days pd
     LEFT JOIN workouts w ON w.id = pd.workout_id
     WHERE pd.program_id = ?
     ORDER BY pd.position ASC`,
    id,
  );

  const days: ProgramDay[] = rows.map((row) => ({
    id: row.id,
    position: row.position,
    workout: row.workout_id ? { id: row.workout_id, name: row.workout_name ?? '' } : null,
  }));

  return {
    id: programRow.id,
    name: programRow.name,
    description: programRow.description,
    days,
    createdAt: programRow.created_at,
    updatedAt: programRow.updated_at,
  };
}

async function insertDays(
  db: SQLiteDatabase,
  programId: string,
  days: ProgramDayInput[],
  timestamp: string,
): Promise<void> {
  for (const [index, day] of days.entries()) {
    await db.runAsync(
      `INSERT INTO program_days (id, program_id, position, workout_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      generateId(),
      programId,
      index,
      day.workoutId,
      timestamp,
      timestamp,
    );
  }
}

export async function createProgram(db: SQLiteDatabase, input: ProgramInput): Promise<string> {
  const id = generateId();
  const timestamp = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO programs (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      id,
      input.name,
      input.description,
      timestamp,
      timestamp,
    );
    await insertDays(db, id, input.days, timestamp);
  });

  return id;
}

// Same replace-all strategy as updateWorkout (see workoutRepository.ts) —
// add/remove/reorder/mark-as-rest all go through "here's the new full day
// list"; program_days has no children of its own to worry about losing.
export async function updateProgram(db: SQLiteDatabase, id: string, input: ProgramInput): Promise<void> {
  const timestamp = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE programs SET name = ?, description = ?, updated_at = ? WHERE id = ?',
      input.name,
      input.description,
      timestamp,
      id,
    );
    await db.runAsync('DELETE FROM program_days WHERE program_id = ?', id);
    await insertDays(db, id, input.days, timestamp);
  });
}

// No check against an active schedule yet — deferred to
// implementation-roadmap.md step 11, once the scheduling engine (step 10)
// exists. See spec/features/program.md, "Editing/deleting a Program with an
// active schedule".
export async function deleteProgram(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM programs WHERE id = ?', id);
}

// "Duplicate program" (spec/features/program.md) — the preferred, emphasized
// option: the copy references the same Workouts as the original.
export async function duplicateProgram(db: SQLiteDatabase, id: string, newName: string): Promise<string> {
  const original = await findProgramById(db, id);
  if (!original) {
    throw new Error(`Program not found: ${id}`);
  }

  return createProgram(db, {
    name: newName,
    description: original.description,
    days: original.days.map((day) => ({ workoutId: day.workout?.id ?? null })),
  });
}

// "Duplicate program and Workouts too" — every referenced Workout is
// independently copied first, so the new Program shares nothing with the
// original (spec/features/program.md).
export async function duplicateProgramWithWorkouts(
  db: SQLiteDatabase,
  id: string,
  newName: string,
): Promise<string> {
  const original = await findProgramById(db, id);
  if (!original) {
    throw new Error(`Program not found: ${id}`);
  }

  const days: ProgramDayInput[] = [];
  for (const day of original.days) {
    if (!day.workout) {
      days.push({ workoutId: null });
      continue;
    }
    const newWorkoutId = await duplicateWorkout(db, day.workout.id, day.workout.name);
    days.push({ workoutId: newWorkoutId });
  }

  return createProgram(db, { name: newName, description: original.description, days });
}
