# Feature: Settings Screen

The Settings screen must hold the app's configuration. Initially include:

- Language
- About

## Language

Allow selecting:

- English
- Español
- Deutsch

The selected language must persist locally. All interface text must use translation keys — don't hardcode UI strings inside components (see [i18n](../technical/i18n.md)).

## About

Show information about the app and credits.

Must include the RepDB attribution per the RepDB — Free Tier License (v1.0), using the exact required text/link:

**Exercise data by RepDB (repdb.co)**

Also state that the exercises and images used in the catalog come from RepDB's `exercise-dataset` project (see [Dataset & Licensing](../technical/dataset-and-licensing.md)).

## Implementation notes (step 17)

Both sections live on one screen (`src/features/settings/screen/SettingsScreen.tsx`) — no sub-navigation; each is small enough that a separate route would just be an extra tap. The language list reuses `useLanguagePreference` (already wired at the app root since [i18n](../technical/i18n.md)'s implementation) for both the current value and switching — selecting a language changes it immediately and persists it, no separate "save" step. App name/version come from `app.json` (`expo.name`/`expo.version`), not hardcoded, so they can't drift from the actual build.

One deliberate exception to [i18n](../technical/i18n.md)'s "all interface text must use translation keys" rule: the RepDB attribution line itself ("Exercise data by RepDB (repdb.co)") is hardcoded verbatim, not run through `t()`. The license requires that *exact* text — translating it would mean it's no longer that exact text. Every other string on this screen, including the surrounding sentence about where the catalog/images come from, is translated normally.
