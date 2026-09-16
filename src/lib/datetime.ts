// ISO 8601 is used for every stored timestamp (createdAt/updatedAt, session
// start/end, etc.) — sortable as text, unambiguous, and portable if a
// backend is added later (see spec/technical/architecture.md).
export function nowIso(): string {
  return new Date().toISOString();
}
