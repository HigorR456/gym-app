import type { SQLiteDatabase } from 'expo-sqlite';

// scheduled_programs has had zero rows in any real install so far — the
// Schedule screen (spec/features/schedule.md) is only being built in this
// step (implementation-roadmap.md step 11). A drop+recreate is safe here
// specifically because of that; this is not the general pattern for
// evolving a table that already holds user data.
//
// Two changes, found while building the scheduling engine (step 10) and
// this step's Program-deletion handling:
//
// - `pending_since_date`: the calendar date the day at
//   current_cycle_position became pending — required to know how overdue a
//   stuck workout day is, since a fixed start_date + N*position formula
//   can't account for the cumulative slide (see spec/technical/
//   database-schema.md and spec/features/schedule.md, "Automatic
//   reschedule on missed checkout").
// - `program_id` moves from no-action to `ON DELETE SET NULL`: spec/
//   features/program.md says deleting a Program with an active schedule
//   ends that schedule and (per "Only one active schedule") never erases
//   its history — but a schedule row (even archived) still needs to
//   survive the Program itself being deleted, the same reason
//   workout_sessions' links use SET NULL (see spec/technical/
//   database-schema.md, "Session history"). A pure no-action FK here would
//   make any Program that was ever scheduled permanently undeletable.
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP TABLE scheduled_programs;

    CREATE TABLE scheduled_programs (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      start_day_position INTEGER NOT NULL,
      current_cycle_position INTEGER NOT NULL,
      pending_since_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_scheduled_programs_program_id ON scheduled_programs(program_id);
    CREATE INDEX idx_scheduled_programs_status ON scheduled_programs(status);
  `);
}
