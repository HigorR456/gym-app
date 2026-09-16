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

## Open item

References like "additional info available in the dataset" (see [Data Model](data-model.md) and [Workout Execution](../features/workout-execution.md)) assume fields in the real `exercises.json` that have not been verified during this spec process. Confirm the actual dataset schema during [implementation step 5](../process/implementation-roadmap.md).
