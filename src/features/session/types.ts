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
  restSeconds: number | null;
  completed: boolean;
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
