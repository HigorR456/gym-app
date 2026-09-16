import type { SQLiteDatabase } from 'expo-sqlite';

// Foreign key policy used throughout this schema (see
// spec/technical/database-schema.md and the feature specs it links to):
//
// - ON DELETE CASCADE: rows that only exist as part of their parent
//   (workout_exercises/workout_sets under a workout, program_days under a
//   program, session_exercises/session_sets under a session) — deleting the
//   parent legitimately deletes them too.
// - No action (default): cross-entity references where the spec requires
//   explicit app-level handling before the referenced row can go away —
//   e.g. deleting a Workout referenced by program_days must first convert
//   those days to rest days (see spec/features/workout.md), and deleting a
//   Program with an active schedule must first archive that schedule (see
//   spec/features/program.md). The FK deliberately blocks a raw delete that
//   skips that step.
// - ON DELETE SET NULL: workout_sessions' links back to the workout/program/
//   schedule it came from — history must survive even if those are deleted
//   later (see spec/features/schedule.md, "Only one active schedule", and
//   spec/technical/database-schema.md, "Session history").
export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name_en TEXT NOT NULL,
      name_es TEXT NOT NULL,
      name_de TEXT NOT NULL,
      description TEXT,
      muscle_group TEXT,
      equipment TEXT,
      image_path TEXT,
      metadata TEXT
    );

    CREATE TABLE workouts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE workout_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

    CREATE TABLE workout_sets (
      id TEXT PRIMARY KEY NOT NULL,
      workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      weight REAL,
      reps INTEGER,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);

    CREATE TABLE programs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE program_days (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      workout_id TEXT REFERENCES workouts(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_program_days_program_id ON program_days(program_id);
    CREATE INDEX idx_program_days_workout_id ON program_days(workout_id);

    CREATE TABLE scheduled_programs (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT NOT NULL REFERENCES programs(id),
      status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      start_day_position INTEGER NOT NULL,
      current_cycle_position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_scheduled_programs_program_id ON scheduled_programs(program_id);
    CREATE INDEX idx_scheduled_programs_status ON scheduled_programs(status);

    CREATE TABLE workout_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT REFERENCES workouts(id) ON DELETE SET NULL,
      program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
      scheduled_program_id TEXT REFERENCES scheduled_programs(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'discarded')),
      started_at TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
    CREATE INDEX idx_workout_sessions_scheduled_program_id ON workout_sessions(scheduled_program_id);

    CREATE TABLE session_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);

    CREATE TABLE session_sets (
      id TEXT PRIMARY KEY NOT NULL,
      session_exercise_id TEXT NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      weight REAL,
      reps INTEGER,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX idx_session_sets_session_exercise_id ON session_sets(session_exercise_id);

    CREATE TABLE app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
