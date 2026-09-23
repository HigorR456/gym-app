import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { findActiveSchedule, reconcileActiveSchedule } from '@/data/sqlite/repositories/scheduleRepository';
import type { ActiveSchedule } from '@/features/schedule/types';
import { todayLocalDate } from '@/lib/date';

// Refetches on focus, mirroring useWorkouts.ts/usePrograms.ts — reconciles
// first so anything resolved since the last visit (e.g. an elapsed rest
// day) shows up immediately (see spec/technical/architecture.md, "hooks
// must reactively reflect writes made elsewhere").
export function useActiveSchedule() {
  const db = useSQLiteContext();
  const [schedule, setSchedule] = useState<ActiveSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const today = todayLocalDate();
    await reconcileActiveSchedule(db, today);
    const result = await findActiveSchedule(db, today);
    setSchedule(result);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return { schedule, loading, refetch };
}
