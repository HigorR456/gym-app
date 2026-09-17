import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import {
  findExerciseFilterOptions,
  findExercises,
  type ExerciseFilters,
} from '@/data/sqlite/repositories/exerciseRepository';

import type { Exercise } from '../types';

export function useExerciseCatalog() {
  const db = useSQLiteContext();
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ bodyParts: string[]; equipment: string[] }>({
    bodyParts: [],
    equipment: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findExerciseFilterOptions(db).then(setFilterOptions);
  }, [db]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    findExercises(db, filters).then((result) => {
      if (!cancelled) {
        setExercises(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, filters]);

  return { exercises, filters, setFilters, filterOptions, loading };
}
