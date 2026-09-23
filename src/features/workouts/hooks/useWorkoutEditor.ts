import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import {
  createWorkout,
  findWorkoutById,
  updateWorkout,
  type WorkoutInput,
} from '@/data/sqlite/repositories/workoutRepository';
import type { Exercise } from '@/features/exercises/types';
import { generateId } from '@/lib/id';
import { DEFAULT_ICON_ID } from '@/lib/icons';

export type EditableSet = {
  id: string;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

export type EditableExercise = {
  id: string;
  exercise: Exercise;
  sets: EditableSet[];
};

// Manages the in-progress edit state for both creating and editing a
// Workout (spec/features/workout.md) — a blank `workoutId` means "new".
// Nothing is written to SQLite until `save()` is called.
export function useWorkoutEditor(workoutId: string | undefined) {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON_ID);
  const [exercises, setExercises] = useState<EditableExercise[]>([]);
  const [loading, setLoading] = useState(!!workoutId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workoutId) {
      return;
    }
    let cancelled = false;
    findWorkoutById(db, workoutId).then((workout) => {
      if (!cancelled && workout) {
        setName(workout.name);
        setIcon(workout.icon);
        setExercises(
          workout.exercises.map((we) => ({
            id: we.id,
            exercise: we.exercise,
            sets: we.sets.map((set) => ({
              id: set.id,
              weight: set.weight,
              reps: set.reps,
              durationSeconds: set.durationSeconds,
              restSeconds: set.restSeconds,
            })),
          })),
        );
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, workoutId]);

  function addExercise(exercise: Exercise) {
    setExercises((prev) => [...prev, { id: generateId(), exercise, sets: [] }]);
  }

  function removeExercise(exerciseLocalId: string) {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseLocalId));
  }

  function moveExercise(exerciseLocalId: string, direction: -1 | 1) {
    setExercises((prev) => {
      const index = prev.findIndex((e) => e.id === exerciseLocalId);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  // New sets start from the previous set's values (when there is one)
  // instead of blank — same "respect the default values" idea as
  // spec/features/workout-execution.md's "Managing sets", applied here so
  // adding Set 4 doesn't mean re-typing everything from Set 3.
  function addSet(exerciseLocalId: string) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseLocalId) {
          return e;
        }
        const lastSet = e.sets[e.sets.length - 1];
        const newSet: EditableSet = {
          id: generateId(),
          weight: lastSet?.weight ?? null,
          reps: lastSet?.reps ?? null,
          durationSeconds: lastSet?.durationSeconds ?? null,
          restSeconds: lastSet?.restSeconds ?? null,
        };
        return { ...e, sets: [...e.sets, newSet] };
      }),
    );
  }

  function removeSet(exerciseLocalId: string, setLocalId: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseLocalId ? { ...e, sets: e.sets.filter((s) => s.id !== setLocalId) } : e,
      ),
    );
  }

  function updateSet(exerciseLocalId: string, setLocalId: string, patch: Partial<EditableSet>) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseLocalId
          ? { ...e, sets: e.sets.map((s) => (s.id === setLocalId ? { ...s, ...patch } : s)) }
          : e,
      ),
    );
  }

  async function save(): Promise<string> {
    setSaving(true);
    try {
      const input: WorkoutInput = {
        name: name.trim(),
        icon,
        exercises: exercises.map((e) => ({
          exerciseId: e.exercise.id,
          sets: e.sets.map((s) => ({
            weight: s.weight,
            reps: s.reps,
            durationSeconds: s.durationSeconds,
            restSeconds: s.restSeconds,
          })),
        })),
      };
      if (workoutId) {
        await updateWorkout(db, workoutId, input);
        return workoutId;
      }
      return await createWorkout(db, input);
    } finally {
      setSaving(false);
    }
  }

  const canSave = name.trim().length > 0;

  return {
    name,
    setName,
    icon,
    setIcon,
    exercises,
    loading,
    saving,
    canSave,
    addExercise,
    removeExercise,
    moveExercise,
    addSet,
    removeSet,
    updateSet,
    save,
  };
}
