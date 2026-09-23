import type { SQLiteDatabase } from 'expo-sqlite';

import { up as up0001 } from './0001_initial_schema';
import { up as up0002 } from './0002_add_icon_columns';
import { up as up0003 } from './0003_schedule_engine';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

// Append-only: never edit a migration that has already shipped. Add a new
// entry with the next version number instead (see spec/technical/architecture.md,
// "SQLite" — "use versioned migrations").
const migrations: Migration[] = [
  { version: 1, up: up0001 },
  { version: 2, up: up0002 },
  { version: 3, up: up0003 },
];

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  const pending = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
    });
    currentVersion = migration.version;
    await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
  }
}
