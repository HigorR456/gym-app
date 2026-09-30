import type { SQLiteDatabase } from 'expo-sqlite';

import { getAppSetting, setAppSetting } from '@/data/sqlite/repositories/appSettingsRepository';
import { createWorkout, type WorkoutInput, type WorkoutSetInput } from '@/data/sqlite/repositories/workoutRepository';

const DEFAULT_WORKOUTS_SEEDED_KEY = 'default_workouts_seeded';

// Every default workout uses the same set scheme (spec/features/workout.md,
// "Default workouts") — a helper avoids repeating this object 25+ times below.
function threeSetsOf10RepsWith90sRest(): WorkoutSetInput[] {
  return Array.from({ length: 3 }, () => ({
    weight: null,
    reps: 10,
    durationSeconds: null,
    restSeconds: 90,
  }));
}

function exercise(exerciseId: string): { exerciseId: string; sets: WorkoutSetInput[] } {
  return { exerciseId, sets: threeSetsOf10RepsWith90sRest() };
}

// Exercise IDs match assets/exercise-dataset/exercises.json (RepDB dataset)
// — verified against the real dataset, not guessed from names.
const DEFAULT_WORKOUTS: WorkoutInput[] = [
  {
    name: 'Push day',
    icon: 'dumbbell',
    exercises: [
      exercise('bench-press'), // Barbell Bench Press
      exercise('incline-db-press'), // Incline Dumbbell Press
      exercise('ohp'), // Barbell Overhead Press
      exercise('lateral-raise'), // Dumbbell Lateral Raise
      exercise('v-bar-tricep-pushdown'), // V-Bar Tricep Pushdown
    ],
  },
  {
    name: 'Pull day',
    icon: 'arm-flex',
    exercises: [
      exercise('pull-up'), // Pull-Up
      exercise('barbell-row'), // Bent-Over Barbell Row
      exercise('seated-cable-row'), // Seated Cable Row
      exercise('hammer-curl'), // Dumbbell Hammer Curl
      exercise('rear-delt-fly'), // Rear Delt Fly
    ],
  },
  {
    name: 'Leg day',
    icon: 'seat-legroom-reduced',
    exercises: [
      exercise('squat'), // Barbell Back Squat
      exercise('hip-abduction'), // Machine Hip Abduction
      exercise('leg-extension'), // Leg Extension
      exercise('seated-leg-curl'), // Seated Leg Curl
      exercise('hip-adduction'), // Hip Adduction
      exercise('bodyweight-calf-raise'), // Bodyweight Calf Raise
    ],
  },
  {
    name: 'Full-body A',
    icon: 'weight-lifter',
    exercises: [
      exercise('goblet-squat'), // Goblet Squat
      exercise('bench-press'), // Barbell Bench Press
      exercise('barbell-row'), // Bent-Over Barbell Row
      exercise('dumbbell-romanian-deadlift'), // Dumbbell Romanian Deadlift
      exercise('plank'), // Plank
    ],
  },
  {
    name: 'Full-body B',
    icon: 'body',
    exercises: [
      exercise('romanian-deadlift'), // Romanian Deadlift
      exercise('ohp'), // Barbell Overhead Press
      exercise('lat-pulldown'), // Lat Pulldown
      exercise('db-lunge'), // Dumbbell Lunge
      exercise('bicycle-crunch'), // Bicycle Crunch
    ],
  },
];

// Runs once, after the exercise catalog is seeded (workout_exercises.exercise_id
// references it) — a one-time app_settings marker guards it, not an
// INSERT-OR-IGNORE-by-id like the catalog, because createWorkout generates a
// fresh UUID per call rather than using a fixed dataset id. This also means
// a user who deletes/renames a default workout keeps that change — reseeding
// only ever happens once, on a fresh install (spec/features/workout.md,
// "Default workouts").
export async function seedDefaultWorkoutsIfNeeded(db: SQLiteDatabase): Promise<void> {
  const alreadySeeded = await getAppSetting(db, DEFAULT_WORKOUTS_SEEDED_KEY);
  if (alreadySeeded === '1') {
    return;
  }

  for (const workout of DEFAULT_WORKOUTS) {
    await createWorkout(db, workout);
  }

  await setAppSetting(db, DEFAULT_WORKOUTS_SEEDED_KEY, '1');
}
