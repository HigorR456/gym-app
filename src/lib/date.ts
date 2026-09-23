// Local calendar dates as YYYY-MM-DD strings — used wherever spec logic
// operates on the device's local date rather than an instant in time (see
// spec/features/schedule.md, "Definition of day": schedule calculations use
// the device's local date, rolling over at local midnight, not UTC).
// Zero-padded YYYY-MM-DD strings sort/compare correctly with plain <, >, ===.

export function todayLocalDate(): string {
  return toLocalDateString(new Date());
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Uses the local-time Date constructor (not UTC) so the result stays
// correct across a DST transition inside the range.
export function addDaysToLocalDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return toLocalDateString(new Date(year, month - 1, day + days));
}
