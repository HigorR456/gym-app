import { useCallback, useState } from 'react';

import { useNowTick } from '@/lib/useNowTick';

export type RestTimerState = {
  active: boolean;
  remainingSeconds: number;
  isOver: boolean;
  start: (durationSeconds: number) => void;
  addSeconds: (delta: number) => void;
  dismiss: () => void;
};

// spec/features/workout-execution.md, "Rest timer" — timestamp-based, not a
// decrementing counter (spec/technical/business-rules.md, rule 8): `endAt`
// is a fixed point in time, and remainingSeconds is recomputed against the
// live clock every tick (see lib/useNowTick), so backgrounding the app
// never desyncs the countdown once it resumes. "+10 sec"/"-10 sec" shift
// `endAt` itself rather than an accumulated remaining value, for the same
// reason.
export function useRestTimer(): RestTimerState {
  const [endAt, setEndAt] = useState<number | null>(null);
  const now = useNowTick();

  const start = useCallback((durationSeconds: number) => {
    setEndAt(Date.now() + durationSeconds * 1000);
  }, []);

  const addSeconds = useCallback((delta: number) => {
    setEndAt((prev) => (prev === null ? prev : Math.max(Date.now(), prev + delta * 1000)));
  }, []);

  const dismiss = useCallback(() => setEndAt(null), []);

  const remainingSeconds = endAt === null ? 0 : Math.max(0, (endAt - now) / 1000);

  return {
    active: endAt !== null,
    remainingSeconds,
    isOver: endAt !== null && remainingSeconds <= 0,
    start,
    addSeconds,
    dismiss,
  };
}
