import { useEffect, useState } from 'react';

// Re-renders its caller once a second so timestamp-derived durations stay
// visually live. The interval only triggers a re-render — it never itself
// stores or increments the displayed value, which is always recomputed from
// real timestamps (Date.now() vs a stored start/end) by the caller. This is
// what spec/technical/business-rules.md rule 8 ("avoid sole reliance on
// setInterval") means in practice: a dropped/delayed tick (e.g. the app
// backgrounding) never desyncs the value, since the very next tick
// recomputes it correctly from the real clock.
export function useNowTick(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
