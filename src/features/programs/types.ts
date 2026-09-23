// Domain types — see spec/technical/data-model.md ("Program") and
// spec/technical/database-schema.md. A day's `workout` is null for a rest
// day; there's no separate boolean, since the DB itself only has a nullable
// `workout_id` (see database-schema.md) and a second flag would just be able
// to disagree with it.
export type ProgramDayWorkout = {
  id: string;
  name: string;
  // The referenced Workout's own icon (see lib/icons.ts) — carried along so
  // a Program day can show it without a second fetch. Not in the original
  // spec, see spec/features/program.md, "Icon selection".
  icon: string;
};

export type ProgramDay = {
  id: string;
  position: number;
  workout: ProgramDayWorkout | null;
};

export type Program = {
  id: string;
  name: string;
  description: string | null;
  // References an id in lib/icons.ts's ICON_OPTIONS — not in the original
  // spec, see spec/features/program.md, "Icon selection".
  icon: string;
  days: ProgramDay[];
  createdAt: string;
  updatedAt: string;
};

// Lightweight shape for the Program list — avoids loading every day's
// workout just to show a name and a day count.
export type ProgramSummary = {
  id: string;
  name: string;
  icon: string;
  dayCount: number;
  updatedAt: string;
};
