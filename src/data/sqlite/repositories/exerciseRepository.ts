import type { SQLiteDatabase } from 'expo-sqlite';

import type { Exercise, ExerciseImages } from '@/features/exercises/types';

export type ExerciseRow = {
  id: string;
  name_en: string;
  name_es: string;
  name_de: string;
  description_en: string | null;
  description_es: string | null;
  description_de: string | null;
  body_part: string | null;
  equipment: string | null;
  difficulty: string | null;
  is_bodyweight: number;
  images: string | null;
};

export function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: { en: row.name_en, es: row.name_es, de: row.name_de },
    description: {
      en: row.description_en,
      es: row.description_es,
      de: row.description_de,
    },
    bodyPart: row.body_part,
    equipment: row.equipment,
    difficulty: row.difficulty,
    isBodyweight: row.is_bodyweight === 1,
    images: (row.images ? JSON.parse(row.images) : {}) as ExerciseImages,
  };
}

export type ExerciseFilters = {
  query?: string;
  bodyPart?: string;
  equipment?: string;
};

// The catalog is a fixed ~600-row read-only table (see
// spec/technical/dataset-and-licensing.md) — a plain filtered SELECT is
// simpler and plenty fast, no need for FTS or in-memory indexing.
export async function findExercises(
  db: SQLiteDatabase,
  filters: ExerciseFilters = {},
): Promise<Exercise[]> {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters.query) {
    conditions.push('(name_en LIKE ? OR name_es LIKE ? OR name_de LIKE ?)');
    const like = `%${filters.query}%`;
    params.push(like, like, like);
  }
  if (filters.bodyPart) {
    conditions.push('body_part = ?');
    params.push(filters.bodyPart);
  }
  if (filters.equipment) {
    conditions.push('equipment = ?');
    params.push(filters.equipment);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<ExerciseRow>(
    `SELECT * FROM exercises ${where} ORDER BY name_en ASC`,
    params,
  );
  return rows.map(toExercise);
}

export async function findExerciseFilterOptions(
  db: SQLiteDatabase,
): Promise<{ bodyParts: string[]; equipment: string[] }> {
  const bodyPartRows = await db.getAllAsync<{ body_part: string }>(
    'SELECT DISTINCT body_part FROM exercises WHERE body_part IS NOT NULL ORDER BY body_part ASC',
  );
  const equipmentRows = await db.getAllAsync<{ equipment: string }>(
    'SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment ASC',
  );
  return {
    bodyParts: bodyPartRows.map((row) => row.body_part),
    equipment: equipmentRows.map((row) => row.equipment),
  };
}
