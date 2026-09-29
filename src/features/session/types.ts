import type { Exercise } from '@/features/exercises/types';

// Domain types for a live/finished workout session (spec/features/
// workout-execution.md) — a session snapshots a Workout's exercises/sets at
// start time into its own rows (session_exercises/session_sets), fully
// decoupled from the Workout from then on (spec/features/workout.md:
// editing a Workout during execution only changes the session's snapshot).
export type SessionSet = {
  id: string;
  position: number;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  // The configured/planned rest, copied from the Workout at session start
  // and editable during execution (spec/features/workout-execution.md,
  // "Sets") — distinct from actualRestSeconds below, which is what the live
  // RestTimer actually measured (spec/technical/database-schema.md,
  // "Session history": "configured/actual rest").
  restSeconds: number | null;
  completed: boolean;
  // Null until the rest period following this set is dismissed (see
  // features/session/hooks/useRestTimer.ts) — never set at all if the set
  // had no configured rest to begin with, since no rest timer ever starts.
  actualRestSeconds: number | null;
};

export type SessionExercise = {
  id: string;
  exercise: Exercise;
  position: number;
  sets: SessionSet[];
};

export type SessionStatus = 'in_progress' | 'completed' | 'discarded';

export type WorkoutSession = {
  id: string;
  workoutId: string | null;
  programId: string | null;
  scheduledProgramId: string | null;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  exercises: SessionExercise[];
};

// Lightweight shape for the boot-time recovery prompt (spec/features/
// workout-execution.md, "Resuming or discarding an in-progress session") —
// avoids loading every exercise/set just to ask "resume this?". workoutName
// is null if the Workout it started from was since deleted (workout_id is
// ON DELETE SET NULL, see spec/technical/database-schema.md).
export type InProgressSessionSummary = {
  id: string;
  workoutName: string | null;
  startedAt: string;
};
