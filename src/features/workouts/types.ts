import type { Exercise } from '@/features/exercises/types';

// Domain types — see spec/technical/data-model.md ("Workout") and
// spec/technical/database-schema.md. A set has reps OR duration, never
// both enforced at the type level (both are optional; the UI decides which
// one to show/edit based on what's filled in, per data-model.md).
export type WorkoutSet = {
  id: string;
  position: number;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

export type WorkoutExercise = {
  id: string;
  // The full catalog Exercise, embedded read-only — lets the UI show the
  // localized name/image without a second round trip (see
  // spec/technical/i18n.md).
  exercise: Exercise;
  position: number;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

// Lightweight shape for the Workout list — avoids loading every exercise/set
// just to show a name and a count.
export type WorkoutSummary = {
  id: string;
  name: string;
  exerciseCount: number;
  updatedAt: string;
};
