import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { findAllProgramSummaries } from '@/data/sqlite/repositories/programRepository';
import type { ProgramSummary } from '@/features/programs/types';

// Refetches on focus rather than keeping a live subscription — mirrors
// useWorkouts.ts (see spec/technical/architecture.md, "hooks must
// reactively reflect writes made elsewhere").
export function usePrograms() {
  const db = useSQLiteContext();
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const result = await findAllProgramSummaries(db);
    setPrograms(result);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return { programs, loading, refetch };
}
