import type { SQLiteDatabase } from 'expo-sqlite';

// Adds the icon selection introduced for Workouts and Programs (not in the
// original spec — see spec/features/workout.md and spec/features/program.md,
// "Icon selection"). Defaults existing rows to the same "weight-lifter"
// default new ones get from the editor (see src/lib/icons.ts,
// DEFAULT_ICON_ID) so nothing renders blank after the update.
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE workouts ADD COLUMN icon TEXT NOT NULL DEFAULT 'weight-lifter';
    ALTER TABLE programs ADD COLUMN icon TEXT NOT NULL DEFAULT 'weight-lifter';
  `);
}
