import { usePathname } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { findInProgressSession } from '@/data/sqlite/repositories/sessionRepository';
import type { InProgressSessionSummary } from '@/features/session/types';

// The second of the two independent app-bootstrap checks (spec/technical/
// architecture.md, "App bootstrap") — runs on cold start and whenever the
// app resumes to the foreground, mirroring useScheduleReconciliation.ts's
// AppState pattern exactly. Unlike reconciliation, this one surfaces
// something for the UI to act on (spec/features/workout-execution.md,
// "the app must offer to resume") rather than silently updating a row, so
// it returns state instead of running fire-and-forget.
//
// Skips the check while already on a /session/* route — the whole point is
// to catch a session left in_progress from *before* this app open, not to
// interrupt the one the user is actively resuming/running right now.
export function useSessionRecovery() {
  const db = useSQLiteContext();
  const pathname = usePathname();
  const onSessionRoute = pathname.startsWith('/session/');
  const appState = useRef(AppState.currentState);
  const [pending, setPending] = useState<InProgressSessionSummary | null>(null);

  useEffect(() => {
    if (onSessionRoute) {
      return;
    }

    void findInProgressSession(db).then(setPending);

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current !== 'active' && nextState === 'active') {
        void findInProgressSession(db).then(setPending);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [db, onSessionRoute]);

  return {
    pending,
    dismiss: () => setPending(null),
  };
}
