import type { SupportedLanguage } from './index';

// Picks the field for the current UI language out of a dataset record that
// carries all three (e.g. Exercise.name/description) — see
// spec/technical/i18n.md, "Exercise names must use the localized fields
// provided by the dataset whenever available".
export function pickLocalized<T>(
  values: Record<SupportedLanguage, T>,
  language: SupportedLanguage,
): T {
  return values[language];
}
