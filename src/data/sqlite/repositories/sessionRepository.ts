import type { SQLiteDatabase } from 'expo-sqlite';

import type { SessionExercise, SessionSet, WorkoutSession } from '@/features/session/types';
import { nowIso } from '@/lib/datetime';
import { generateId } from '@/lib/id';

import { type ExerciseRow, toExercise } from './exerciseRepository';
import { findWorkoutById } from './workoutRepository';

export type StartSessionInput = {
  workoutId: string;
  // Set together — spec/features/workout-execution.md, "Finishing the
  // workout": programId is only set when launched via the Program → Today's
  // Workout flow; scheduledProgramId is set in that case *and* when started
  // directly from the Workout list matching today's pending day (see
  // spec/features/start.md, "Starting a workout while a schedule is
  // active") — either way is what makes reconcileActiveSchedule's
  // hasCheckout lookup see this session once it's finished.
  programId: string | null;
  scheduledProgramId: string | null;
};

// "On starting a workout, immediately start a session-wide timer... open
// the exercise execution screen" (spec/features/workout-execution.md) — the
// session and its snapshot are persisted immediately, write-through, rather
// than held in memory until Finish: "a workout session must not be lost if
// the app is temporarily backgrounded" (spec/technical/business-rules.md,
// rules 7 & 10). Every mutation below (set edits, completion, add/remove
// set, add exercise) persists the same way. Snapshots the Workout's current
// exercises/sets — see spec/features/workout.md, "the original Workout is
// not modified" by later session edits.
export async function startSession(db: SQLiteDatabase, input: StartSessionInput): Promise<string> {
  const workout = await findWorkoutById(db, input.workoutId);
  if (!workout) {
    throw new Error(`Workout not found: ${input.workoutId}`);
  }

  const sessionId = generateId();
  const timestamp = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO workout_sessions
         (id, workout_id, program_id, scheduled_program_id, status, started_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'in_progress', ?, ?, ?)`,
      sessionId,
      input.workoutId,
      input.programId,
      input.scheduledProgramId,
      timestamp,
      timestamp,
      timestamp,
    );

    for (const [exerciseIndex, workoutExercise] of workout.exercises.entries()) {
      const sessionExerciseId = generateId();
      await db.runAsync(
        `INSERT INTO session_exercises (id, session_id, exercise_id, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        sessionExerciseId,
        sessionId,
        workoutExercise.exercise.id,
        exerciseIndex,
        timestamp,
        timestamp,
      );
      for (const [setIndex, set] of workoutExercise.sets.entries()) {
        await db.runAsync(
          `INSERT INTO session_sets
             (id, session_exercise_id, position, weight, reps, duration_seconds, rest_seconds, completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          generateId(),
          sessionExerciseId,
          setIndex,
          set.weight,
          set.reps,
          set.durationSeconds,
          set.restSeconds,
          timestamp,
          timestamp,
        );
      }
    }
  });

  return sessionId;
}

type SessionExerciseSetRow = ExerciseRow & {
  se_id: string;
  se_position: number;
  ss_id: string | null;
  ss_position: number | null;
  ss_weight: number | null;
  ss_reps: number | null;
  ss_duration_seconds: number | null;
  ss_rest_seconds: number | null;
  ss_completed: number | null;
};

export async function findSessionById(db: SQLiteDatabase, id: string): Promise<WorkoutSession | null> {
  const sessionRow = await db.getFirstAsync<{
    id: string;
    workout_id: string | null;
    program_id: string | null;
    scheduled_program_id: string | null;
    status: WorkoutSession['status'];
    started_at: string;
    ended_at: string | null;
  }>(
    'SELECT id, workout_id, program_id, scheduled_program_id, status, started_at, ended_at FROM workout_sessions WHERE id = ?',
    id,
  );
  if (!sessionRow) {
    return null;
  }

  // LEFT JOIN so a just-added exercise with no sets yet still shows up.
  const rows = await db.getAllAsync<SessionExerciseSetRow>(
    `SELECT
       se.id as se_id, se.position as se_position,
       ex.*,
       ss.id as ss_id, ss.position as ss_position, ss.weight as ss_weight,
       ss.reps as ss_reps, ss.duration_seconds as ss_duration_seconds,
       ss.rest_seconds as ss_rest_seconds, ss.completed as ss_completed
     FROM session_exercises se
     JOIN exercises ex ON ex.id = se.exercise_id
     LEFT JOIN session_sets ss ON ss.session_exercise_id = se.id
     WHERE se.session_id = ?
     ORDER BY se.position ASC, ss.position ASC`,
    id,
  );

  const exercisesById = new Map<string, SessionExercise>();
  for (const row of rows) {
    let sessionExercise = exercisesById.get(row.se_id);
    if (!sessionExercise) {
      sessionExercise = { id: row.se_id, exercise: toExercise(row), position: row.se_position, sets: [] };
      exercisesById.set(row.se_id, sessionExercise);
    }
    if (row.ss_id) {
      const set: SessionSet = {
        id: row.ss_id,
        position: row.ss_position ?? 0,
        weight: row.ss_weight,
        reps: row.ss_reps,
        durationSeconds: row.ss_duration_seconds,
        restSeconds: row.ss_rest_seconds,
        completed: row.ss_completed === 1,
      };
      sessionExercise.sets.push(set);
    }
  }

  return {
    id: sessionRow.id,
    workoutId: sessionRow.workout_id,
    programId: sessionRow.program_id,
    scheduledProgramId: sessionRow.scheduled_program_id,
    status: sessionRow.status,
    startedAt: sessionRow.started_at,
    endedAt: sessionRow.ended_at,
    exercises: [...exercisesById.values()].sort((a, b) => a.position - b.position),
  };
}

export type SessionSetPatch = {
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

export async function updateSessionSet(db: SQLiteDatabase, sessionSetId: string, patch: SessionSetPatch): Promise<void> {
  await db.runAsync(
    `UPDATE session_sets SET weight = ?, reps = ?, duration_seconds = ?, rest_seconds = ?, updated_at = ? WHERE id = ?`,
    patch.weight,
    patch.reps,
    patch.durationSeconds,
    patch.restSeconds,
    nowIso(),
    sessionSetId,
  );
}

// "Marking the set as completed" (spec/features/workout-execution.md,
// "Sets") — the rest timer this normally triggers is a step 14 concern
// (Timers), not built yet; this only records completion.
export async function setSessionSetCompleted(db: SQLiteDatabase, sessionSetId: string, completed: boolean): Promise<void> {
  await db.runAsync('UPDATE session_sets SET completed = ?, updated_at = ? WHERE id = ?', completed ? 1 : 0, nowIso(), sessionSetId);
}

// New sets start from the previous set's values, when there is one — same
// "respect default values" rule as spec/features/workout-execution.md,
// "Managing sets", mirroring useWorkoutEditor's addSet.
export async function addSessionSet(
  db: SQLiteDatabase,
  sessionExerciseId: string,
  previous: SessionSetPatch | null,
): Promise<SessionSet> {
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM session_sets WHERE session_exercise_id = ?',
    sessionExerciseId,
  );
  const position = countRow?.count ?? 0;
  const id = generateId();
  const timestamp = nowIso();
  const weight = previous?.weight ?? null;
  const reps = previous?.reps ?? null;
  const durationSeconds = previous?.durationSeconds ?? null;
  const restSeconds = previous?.restSeconds ?? null;

  await db.runAsync(
    `INSERT INTO session_sets
       (id, session_exercise_id, position, weight, reps, duration_seconds, rest_seconds, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    id,
    sessionExerciseId,
    position,
    weight,
    reps,
    durationSeconds,
    restSeconds,
    timestamp,
    timestamp,
  );

  return { id, position, weight, reps, durationSeconds, restSeconds, completed: false };
}

export async function removeSessionSet(db: SQLiteDatabase, sessionSetId: string): Promise<void> {
  await db.runAsync('DELETE FROM session_sets WHERE id = ?', sessionSetId);
}

// "Adding exercises mid-session" (spec/features/workout-execution.md) — only
// part of this session's snapshot, the original Workout is untouched.
export async function addSessionExercise(db: SQLiteDatabase, sessionId: string, exerciseId: string): Promise<string> {
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM session_exercises WHERE session_id = ?',
    sessionId,
  );
  const position = countRow?.count ?? 0;
  const id = generateId();
  const timestamp = nowIso();
  await db.runAsync(
    `INSERT INTO session_exercises (id, session_id, exercise_id, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    sessionId,
    exerciseId,
    position,
    timestamp,
    timestamp,
  );
  return id;
}

// "Finishing the workout" (spec/features/workout-execution.md) — the
// schedule updates itself: reconcileActiveSchedule's hasCheckout lookup
// (see scheduleRepository.ts) reads completed sessions by
// scheduled_program_id, so setting status/ended_at here is enough; no
// separate "mark scheduled day completed" call is needed.
export async function finishSession(db: SQLiteDatabase, sessionId: string): Promise<void> {
  const timestamp = nowIso();
  await db.runAsync(
    "UPDATE workout_sessions SET status = 'completed', ended_at = ?, updated_at = ? WHERE id = ?",
    timestamp,
    timestamp,
    sessionId,
  );
}

// "An explicit discard session action" (spec/features/workout-execution.md,
// "Starting a session") — discarded sessions don't count as completed on
// the Schedule (excluded from hasCheckout's 'completed' filter).
export async function discardSession(db: SQLiteDatabase, sessionId: string): Promise<void> {
  const timestamp = nowIso();
  await db.runAsync(
    "UPDATE workout_sessions SET status = 'discarded', ended_at = ?, updated_at = ? WHERE id = ?",
    timestamp,
    timestamp,
    sessionId,
  );
}
