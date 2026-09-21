import type { SQLiteDatabase } from 'expo-sqlite';

import type { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary } from '@/features/workouts/types';
import { nowIso } from '@/lib/datetime';
import { generateId } from '@/lib/id';

import { type ExerciseRow, toExercise } from './exerciseRepository';

export type WorkoutSetInput = {
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

export type WorkoutExerciseInput = {
  exerciseId: string;
  sets: WorkoutSetInput[];
};

export type WorkoutInput = {
  name: string;
  exercises: WorkoutExerciseInput[];
};

export async function findAllWorkoutSummaries(db: SQLiteDatabase): Promise<WorkoutSummary[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    updated_at: string;
    exercise_count: number;
  }>(
    `SELECT w.id, w.name, w.updated_at, COUNT(we.id) as exercise_count
     FROM workouts w
     LEFT JOIN workout_exercises we ON we.workout_id = w.id
     GROUP BY w.id
     ORDER BY w.updated_at DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    exerciseCount: row.exercise_count,
    updatedAt: row.updated_at,
  }));
}

type WorkoutExerciseSetRow = ExerciseRow & {
  we_id: string;
  we_position: number;
  ws_id: string | null;
  ws_position: number | null;
  ws_weight: number | null;
  ws_reps: number | null;
  ws_duration_seconds: number | null;
  ws_rest_seconds: number | null;
};

export async function findWorkoutById(db: SQLiteDatabase, id: string): Promise<Workout | null> {
  const workoutRow = await db.getFirstAsync<{ id: string; name: string; created_at: string; updated_at: string }>(
    'SELECT id, name, created_at, updated_at FROM workouts WHERE id = ?',
    id,
  );
  if (!workoutRow) {
    return null;
  }

  // LEFT JOIN so a just-added exercise with no sets yet still shows up.
  const rows = await db.getAllAsync<WorkoutExerciseSetRow>(
    `SELECT
       we.id as we_id, we.position as we_position,
       ex.*,
       ws.id as ws_id, ws.position as ws_position, ws.weight as ws_weight,
       ws.reps as ws_reps, ws.duration_seconds as ws_duration_seconds, ws.rest_seconds as ws_rest_seconds
     FROM workout_exercises we
     JOIN exercises ex ON ex.id = we.exercise_id
     LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
     WHERE we.workout_id = ?
     ORDER BY we.position ASC, ws.position ASC`,
    id,
  );

  const exercisesById = new Map<string, WorkoutExercise>();
  for (const row of rows) {
    let workoutExercise = exercisesById.get(row.we_id);
    if (!workoutExercise) {
      workoutExercise = {
        id: row.we_id,
        exercise: toExercise(row),
        position: row.we_position,
        sets: [],
      };
      exercisesById.set(row.we_id, workoutExercise);
    }
    if (row.ws_id) {
      const set: WorkoutSet = {
        id: row.ws_id,
        position: row.ws_position ?? 0,
        weight: row.ws_weight,
        reps: row.ws_reps,
        durationSeconds: row.ws_duration_seconds,
        restSeconds: row.ws_rest_seconds,
      };
      workoutExercise.sets.push(set);
    }
  }

  return {
    id: workoutRow.id,
    name: workoutRow.name,
    createdAt: workoutRow.created_at,
    updatedAt: workoutRow.updated_at,
    exercises: [...exercisesById.values()].sort((a, b) => a.position - b.position),
  };
}

async function insertExercisesAndSets(
  db: SQLiteDatabase,
  workoutId: string,
  exercises: WorkoutExerciseInput[],
  timestamp: string,
): Promise<void> {
  for (const [exerciseIndex, exerciseInput] of exercises.entries()) {
    const workoutExerciseId = generateId();
    await db.runAsync(
      `INSERT INTO workout_exercises (id, workout_id, exercise_id, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      workoutExerciseId,
      workoutId,
      exerciseInput.exerciseId,
      exerciseIndex,
      timestamp,
      timestamp,
    );
    for (const [setIndex, setInput] of exerciseInput.sets.entries()) {
      await db.runAsync(
        `INSERT INTO workout_sets
           (id, workout_exercise_id, position, weight, reps, duration_seconds, rest_seconds, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        generateId(),
        workoutExerciseId,
        setIndex,
        setInput.weight,
        setInput.reps,
        setInput.durationSeconds,
        setInput.restSeconds,
        timestamp,
        timestamp,
      );
    }
  }
}

export async function createWorkout(db: SQLiteDatabase, input: WorkoutInput): Promise<string> {
  const id = generateId();
  const timestamp = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO workouts (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      id,
      input.name,
      timestamp,
      timestamp,
    );
    await insertExercisesAndSets(db, id, input.exercises, timestamp);
  });

  return id;
}

// Simplest correct strategy: replace all exercises/sets rather than diffing
// against the previous state — reordering, adding, and removing exercises
// all go through the same "here's the new full list" path. workout_exercises
// cascades to workout_sets (see migrations/0001_initial_schema.ts), so
// deleting the parent rows is enough.
export async function updateWorkout(db: SQLiteDatabase, id: string, input: WorkoutInput): Promise<void> {
  const timestamp = nowIso();

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE workouts SET name = ?, updated_at = ? WHERE id = ?', input.name, timestamp, id);
    await db.runAsync('DELETE FROM workout_exercises WHERE workout_id = ?', id);
    await insertExercisesAndSets(db, id, input.exercises, timestamp);
  });
}

// No check against Program references yet — deferred to
// implementation-roadmap.md step 11, once Programs exist (step 9) and the
// scheduling engine (step 10) does. See spec/features/workout.md, "Deleting
// a Workout referenced by Programs".
export async function deleteWorkout(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
}

export async function duplicateWorkout(db: SQLiteDatabase, id: string, newName: string): Promise<string> {
  const original = await findWorkoutById(db, id);
  if (!original) {
    throw new Error(`Workout not found: ${id}`);
  }

  return createWorkout(db, {
    name: newName,
    exercises: original.exercises.map((exercise) => ({
      exerciseId: exercise.exercise.id,
      sets: exercise.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
        durationSeconds: set.durationSeconds,
        restSeconds: set.restSeconds,
      })),
    })),
  });
}
