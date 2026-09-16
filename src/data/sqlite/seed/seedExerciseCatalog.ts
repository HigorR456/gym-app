import type { SQLiteDatabase } from 'expo-sqlite';

// eslint-disable-next-line import/no-unresolved -- bundled dataset asset, see assets/exercise-dataset
import exerciseDataset from '../../../../assets/exercise-dataset/exercises.json';

type RawExercise = {
  id: string;
  name_en: string;
  name_es: string;
  name_de: string;
  description_en?: string;
  description_es?: string;
  description_de?: string;
  body_part?: string;
  equipment?: string;
  difficulty?: string;
  is_bodyweight?: boolean;
  images?: { flat?: Record<string, string> };
  [key: string]: unknown;
};

// Columns that get their own field on the `exercises` table — everything
// else in the raw dataset entry is kept as-is in the `metadata` JSON column
// (see the comment on the `exercises` table in
// src/data/sqlite/migrations/0001_initial_schema.ts for why).
const COLUMN_KEYS = new Set([
  'id',
  'name_en',
  'name_es',
  'name_de',
  'description_en',
  'description_es',
  'description_de',
  'body_part',
  'equipment',
  'difficulty',
  'is_bodyweight',
  'images',
]);

// The dataset's `images.flat` values are paths like
// "images/flat/ab-wheel-rollout-peak.webp" — the generated image map (see
// scripts/generate-exercise-image-map.cjs) keys its `require()`s by the
// filename alone, so that's what gets stored on the row.
function imageKeyFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() ?? filePath;
  return fileName.replace(/\.webp$/, '');
}

function toImagesColumn(raw: RawExercise): string | null {
  const flat = raw.images?.flat;
  if (!flat) {
    return null;
  }
  const keyed: Record<string, string> = {};
  for (const [pose, filePath] of Object.entries(flat)) {
    keyed[pose] = imageKeyFromPath(filePath);
  }
  return JSON.stringify(keyed);
}

function toMetadataColumn(raw: RawExercise): string {
  const metadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!COLUMN_KEYS.has(key)) {
      metadata[key] = value;
    }
  }
  return JSON.stringify(metadata);
}

// Idempotent and resumable: if a previous run was interrupted partway
// (spec/technical/database-schema.md, "Critical failure handling" —
// "Dataset import failure"), re-running finishes the job via `INSERT OR
// IGNORE` instead of erroring on already-seeded rows.
export async function seedExerciseCatalogIfNeeded(db: SQLiteDatabase): Promise<void> {
  const exercises = (exerciseDataset as unknown as { exercises: RawExercise[] }).exercises;

  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
  if ((row?.count ?? 0) >= exercises.length) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercises
          (id, name_en, name_es, name_de, description_en, description_es, description_de, body_part, equipment, difficulty, is_bodyweight, images, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        exercise.id,
        exercise.name_en,
        exercise.name_es,
        exercise.name_de,
        exercise.description_en ?? null,
        exercise.description_es ?? null,
        exercise.description_de ?? null,
        exercise.body_part ?? null,
        exercise.equipment ?? null,
        exercise.difficulty ?? null,
        exercise.is_bodyweight ? 1 : 0,
        toImagesColumn(exercise),
        toMetadataColumn(exercise),
      );
    }
  });
}
