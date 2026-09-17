import type { SQLiteDatabase } from 'expo-sqlite';

// `app_settings` is a plain key/value table (see
// spec/technical/database-schema.md) — no id/createdAt/updatedAt, since it's
// app-local config, not a user-created entity that needs sync-readiness
// (see spec/technical/architecture.md, "Preparing for future sync").
export async function getAppSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setAppSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
