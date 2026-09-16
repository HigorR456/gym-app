import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDbIfNeeded } from './migrations';
import { seedExerciseCatalogIfNeeded } from './seed/seedExerciseCatalog';

// Runs once, via SQLiteProvider's `onInit`, before the app renders anything
// that touches the database. Schema migrations and catalog seeding are
// deliberately separate concerns (see seedExerciseCatalog.ts) composed here,
// not merged into one function.
export async function bootstrapDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDbIfNeeded(db);
  await seedExerciseCatalogIfNeeded(db);
}
