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
