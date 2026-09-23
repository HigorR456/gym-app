import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import {
  addSessionExercise,
  addSessionSet,
  discardSession,
  finishSession,
  findSessionById,
  removeSessionSet,
  setSessionSetCompleted,
  updateSessionSet,
} from '@/data/sqlite/repositories/sessionRepository';
import type { Exercise } from '@/features/exercises/types';
import type { SessionSet, WorkoutSession } from '@/features/session/types';

// Loads a session and keeps local state in sync with the write-through
// persistence in sessionRepository.ts — every mutator below updates SQLite
// first (so nothing is lost if the app backgrounds mid-session, spec/
// technical/business-rules.md rules 7 & 10) and only then mirrors the
// change into local state, rather than the other way around.
export function useSessionExecution(sessionId: string) {
  const db = useSQLiteContext();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    findSessionById(db, sessionId).then((result) => {
      if (!cancelled) {
        setSession(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, sessionId]);

  const exercises = session?.exercises ?? [];
  const total = exercises.length;
  const safeIndex = total === 0 ? 0 : Math.min(exerciseIndex, total - 1);
  const currentExercise = exercises[safeIndex] ?? null;

  function goPrevious() {
    setExerciseIndex((prev) => Math.max(0, prev - 1));
  }

  function goNext() {
    setExerciseIndex((prev) => Math.min(total - 1, prev + 1));
  }

  async function updateSet(sessionExerciseId: string, setId: string, patch: Partial<SessionSet>) {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === sessionExerciseId
                ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
                : e,
            ),
          }
        : prev,
    );
    const set = exercises.find((e) => e.id === sessionExerciseId)?.sets.find((s) => s.id === setId);
    const merged = { ...set, ...patch };
    await updateSessionSet(db, setId, {
      weight: merged.weight ?? null,
      reps: merged.reps ?? null,
      durationSeconds: merged.durationSeconds ?? null,
      restSeconds: merged.restSeconds ?? null,
    });
  }

  async function toggleSetCompleted(sessionExerciseId: string, setId: string) {
    const set = exercises.find((e) => e.id === sessionExerciseId)?.sets.find((s) => s.id === setId);
    if (!set) {
      return;
    }
    const completed = !set.completed;
    setSession((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === sessionExerciseId
                ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)) }
                : e,
            ),
          }
        : prev,
    );
    await setSessionSetCompleted(db, setId, completed);
  }

  async function addSet(sessionExerciseId: string) {
    const exercise = exercises.find((e) => e.id === sessionExerciseId);
    const lastSet = exercise?.sets[exercise.sets.length - 1] ?? null;
    const newSet = await addSessionSet(db, sessionExerciseId, lastSet);
    setSession((prev) =>
      prev
        ? { ...prev, exercises: prev.exercises.map((e) => (e.id === sessionExerciseId ? { ...e, sets: [...e.sets, newSet] } : e)) }
        : prev,
    );
  }

  async function removeSet(sessionExerciseId: string, setId: string) {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === sessionExerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
            ),
          }
        : prev,
    );
    await removeSessionSet(db, setId);
  }

  async function addExercise(exercise: Exercise) {
    const id = await addSessionExercise(db, sessionId, exercise.id);
    setSession((prev) =>
      prev
        ? { ...prev, exercises: [...prev.exercises, { id, exercise, position: prev.exercises.length, sets: [] }] }
        : prev,
    );
    setExerciseIndex(total);
  }

  async function finish() {
    await finishSession(db, sessionId);
  }

  async function discard() {
    await discardSession(db, sessionId);
  }

  return {
    session,
    loading,
    exercises,
    total,
    exerciseIndex: safeIndex,
    currentExercise,
    goPrevious,
    goNext,
    updateSet,
    toggleSetCompleted,
    addSet,
    removeSet,
    addExercise,
    finish,
    discard,
  };
}
