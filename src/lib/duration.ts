// mm:ss for durations under an hour, hh:mm:ss beyond that — used by the
// Finish Workout confirmation's "Total time" readout (spec/features/
// workout-execution.md). A static read at the moment Finish is tapped, not
// a live ticking clock — the ticking session-wide Timer component is a
// step 14 (Timers) concern.
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}
