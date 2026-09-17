// Domain type — independent from the SQLite row shape (see
// spec/technical/architecture.md, TypeScript conventions). The repository
// layer is responsible for mapping between the two.
export type ExerciseImages = Partial<Record<'start' | 'peak' | 'main', string>>;

export type LocalizedText = {
  en: string;
  es: string;
  de: string;
};

export type LocalizedOptionalText = {
  en: string | null;
  es: string | null;
  de: string | null;
};

export type Exercise = {
  id: string;
  name: LocalizedText;
  description: LocalizedOptionalText;
  bodyPart: string | null;
  equipment: string | null;
  difficulty: string | null;
  isBodyweight: boolean;
  images: ExerciseImages;
};
