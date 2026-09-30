import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDbIfNeeded } from './migrations';
import { seedDefaultWorkoutsIfNeeded } from './seed/seedDefaultWorkouts';
import { seedExerciseCatalogIfNeeded } from './seed/seedExerciseCatalog';

// Runs once, via SQLiteProvider's `onInit`, before the app renders anything
// that touches the database. Schema migrations and catalog seeding are
// deliberately separate concerns (see seedExerciseCatalog.ts) composed here,
// not merged into one function. Default workouts are seeded last since they
// reference exercises by id (workout_exercises.exercise_id) and must find
// the catalog already populated.
export async function bootstrapDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDbIfNeeded(db);
  await seedExerciseCatalogIfNeeded(db);
  await seedDefaultWorkoutsIfNeeded(db);
}
