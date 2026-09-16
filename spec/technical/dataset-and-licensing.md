# Exercise Dataset & Licensing

## Source

Use the exercise list from:

https://github.com/RepDB/exercise-dataset

Specifically:

- `exercises.json`
- WebP images under `/images/flat`

Exercises already ship with localization for:

- English
- Spanish
- German

The app must import these exercises into its local database and use them as the initial catalog. Exercise images must be bundled/stored so they remain available offline.

Do not improperly modify the original dataset data.

## Attribution

The dataset is distributed under the **RepDB — Free Tier License (v1.0)**. Personal and commercial use inside applications is free, as long as attribution is visible.

Attribution must use the exact text/link required by the license:

> Exercise data by RepDB (repdb.co)

This link must appear clearly on the **Settings → About** screen (see [Settings](../features/settings.md)).

It must also be possible to state that the exercise catalog and images used by the app come from RepDB's `exercise-dataset` project.

## License restrictions to respect in implementation

- **Free-tier images only**: import only the WebP images from `/images/flat` (flat-style, free tier). Do not bundle any content from preview/paid-tier folders (e.g. `premium-samples/`) — the license restricts those to evaluation use, not production.
- **No redistribution as a dataset**: the app must not offer export, a public API, or any way of passing along `exercises.json`/images as a dataset to third parties. Use is in-app only.
- **No generative-AI derivation**: images may not be used as input/reference/conditioning for generative models (style transfer, fine-tuning, etc.), even in future features.
- Permitted image modifications for in-app use: resize, crop, recolor. Upscaled or background-removed derivatives fall under the no-redistribution rule.

## Confirmed dataset schema

Verified directly against the live repository during [implementation step 5](../process/implementation-roadmap.md) (resolves the schema-verification item this section used to flag as open). The license text and restrictions above were confirmed to match `LICENSE-DATA.md`/`ATTRIBUTION.md` in the source repo exactly — no correction needed there.

`exercises.json` is `{ name, homepage, license, schema_version, count, exercises: [...] }` — 601 entries (schema_version 3) as of this import. Each entry has: `id`, `name_en`/`name_es`/`name_de`, `description_en`/`description_es`/`description_de`, `category`, `force_type`, `mechanic`, `difficulty`, `equipment`, `body_part`, `primary_muscles`/`secondary_muscles` (arrays), `goals`/`tags` (arrays), `is_unilateral`/`is_bodyweight` (booleans), `instructions_en`/`instructions_es`/`instructions_de` (arrays of steps), `tips_en`/`tips_es`/`tips_de` (arrays), `met`, and `images.flat` (one or two WebP paths — `start`/`peak`, or a single `main`, depending on the exercise).

`images/flat/` has 1056 WebP files (~20MB) for the 601 exercises. `images/equipment` and `images/muscles` (icon sets) exist in the source repo too but aren't imported — nothing in the spec currently needs them.

## Implementation notes

- The dataset is vendored (not fetched at runtime) under `assets/exercise-dataset/`: `exercises.json`, `images/flat/*.webp`, plus a copy of `LICENSE-DATA.md`/`ATTRIBUTION.md` for provenance. This is a one-time import done during implementation, not a build step that re-downloads from RepDB — re-run it manually (repeat step 5) if RepDB ships a dataset update.
- Metro can only bundle image `require()`s it can see as literal strings, and these 1056 images are looked up dynamically by key (from the `exercises` table), not statically known per call site. `scripts/generate-exercise-image-map.cjs` generates `src/data/sqlite/seed/exerciseImages.generated.ts` — one explicit `require()` per file — so Metro bundles them normally. Regenerate it if the images folder changes.
- `exercises.json` is imported directly as a module (`resolveJsonModule`) and seeded into the `exercises` table on app bootstrap — see [Database Schema](database-schema.md).
