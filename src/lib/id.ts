import { randomUUID } from 'expo-crypto';

// Client-generated IDs (UUID v4) — required by the sync-readiness principle
// in spec/technical/architecture.md, instead of local auto-increment ids.
export function generateId(): string {
  return randomUUID();
}
