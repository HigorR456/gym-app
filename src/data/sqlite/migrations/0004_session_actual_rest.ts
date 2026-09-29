import type { SQLiteDatabase } from 'expo-sqlite';

// spec/technical/database-schema.md, "Session history": the history record
// must capture "configured/actual rest", not just one value — session_sets'
// existing rest_seconds already tracks the configured/planned rest (copied
// from the Workout at session start, editable during execution, see
// spec/features/workout-execution.md, "Sets"). It alone can't reflect the
// *actual* rest taken, which can diverge from it via the live RestTimer's
// "+10 sec"/"-10 sec"/Skip (step 14) — e.g. skipping a 90s rest at 40s.
// Found while auditing session-saving completeness for step 16.
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE session_sets ADD COLUMN actual_rest_seconds INTEGER;
  `);
}
