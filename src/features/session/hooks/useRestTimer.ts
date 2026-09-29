import { useCallback, useState } from 'react';

import { secondsBetween } from '@/lib/date';
import { useNowTick } from '@/lib/useNowTick';

// Which set this rest period follows — carried alongside the countdown so
// the caller can attribute the eventually-measured actual rest duration to
// the right session_sets row (spec/technical/database-schema.md, "Session
// history": "configured/actual rest") without threading it through every
// call separately.
export type RestTimerContext = {
  sessionExerciseId: string;
  setId: string;
};

export type RestTimerState = {
  active: boolean;
  remainingSeconds: number;
  isOver: boolean;
  context: RestTimerContext | null;
  startedAtMs: number | null;
  start: (durationSeconds: number, context: RestTimerContext) => void;
  addSeconds: (delta: number) => void;
  dismiss: () => void;
};

// spec/features/workout-execution.md, "Rest timer" — timestamp-based, not a
// decrementing counter (spec/technical/business-rules.md, rule 8): `endAt`
// is a fixed point in time, and remainingSeconds is recomputed against the
// live clock every tick (see lib/useNowTick), so backgrounding the app
// never desyncs the countdown once it resumes. "+10 sec"/"-10 sec" shift
// `endAt` itself rather than an accumulated remaining value, for the same
// reason. `startedAtMs` is exposed (rather than kept private) so the caller
// can compute the actual elapsed rest at dismiss time using the same shared
// secondsBetween helper, instead of this hook owning that persistence
// concern itself.
export function useRestTimer(): RestTimerState {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [context, setContext] = useState<RestTimerContext | null>(null);
  const now = useNowTick();

  const start = useCallback((durationSeconds: number, nextContext: RestTimerContext) => {
    const startTime = Date.now();
    setStartedAtMs(startTime);
    setEndAt(startTime + durationSeconds * 1000);
    setContext(nextContext);
  }, []);

  const addSeconds = useCallback((delta: number) => {
    setEndAt((prev) => (prev === null ? prev : Math.max(Date.now(), prev + delta * 1000)));
  }, []);

  const dismiss = useCallback(() => {
    setEndAt(null);
    setStartedAtMs(null);
    setContext(null);
  }, []);

  const remainingSeconds = endAt === null ? 0 : Math.max(0, secondsBetween(now, endAt));

  return {
    active: endAt !== null,
    remainingSeconds,
    isOver: endAt !== null && remainingSeconds <= 0,
    context,
    startedAtMs,
    start,
    addSeconds,
    dismiss,
  };
}
