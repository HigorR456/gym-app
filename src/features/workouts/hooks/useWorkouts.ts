import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { findAllWorkoutSummaries } from '@/data/sqlite/repositories/workoutRepository';
import type { WorkoutSummary } from '@/features/workouts/types';

// Refetches on focus rather than keeping a live subscription — simplest way
// to reflect writes made elsewhere (create/edit/delete/duplicate all
// navigate back to this list) without a query-caching library (see
// spec/technical/architecture.md, "hooks must reactively reflect writes
// made elsewhere").
export function useWorkouts() {
  const db = useSQLiteContext();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const result = await findAllWorkoutSummaries(db);
    setWorkouts(result);
    setLoading(false);
  }, [db]);

  // Handles navigating back from create/edit; refetch() below handles
  // in-place actions (delete/duplicate) that don't change focus.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return { workouts, loading, refetch };
}
