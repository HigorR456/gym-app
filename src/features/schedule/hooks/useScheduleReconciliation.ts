import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { reconcileActiveSchedule } from '@/data/sqlite/repositories/scheduleRepository';
import { todayLocalDate } from '@/lib/date';

// Runs schedule reconciliation on cold start and whenever the app resumes
// to the foreground (spec/technical/architecture.md, "App bootstrap") — a
// separate, independent check from in-progress session recovery (not built
// yet, see implementation-roadmap.md step 15), not bundled into one
// monolithic on-start function.
export function useScheduleReconciliation(): void {
  const db = useSQLiteContext();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    void reconcileActiveSchedule(db, todayLocalDate());

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current !== 'active' && nextState === 'active') {
        void reconcileActiveSchedule(db, todayLocalDate());
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [db]);
}
