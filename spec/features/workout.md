# Feature: Workout Screen

The **Workout** screen shows the Workouts created by the user.

It must be possible to:

- create a Workout
- edit a Workout
- delete a Workout
- duplicate a Workout
- rename it
- add exercises
- remove exercises
- reorder exercises
- configure sets

Each exercise must allow configuring:

- number of sets
- weight
- reps
- duration/time
- rest between sets

Example:

### Bench Press

3 sets

Set 1:
- 60 kg
- 10 reps
- 90s rest

Set 2:
- 60 kg
- 10 reps
- 90s rest

Set 3:
- 65 kg
- 8 reps
- 120s rest

The user must be able to edit this information both before and during execution.

- Editing weight, reps, rest, or sets **before** execution (on the Workout screen) changes the Workout's default configuration, applying to future executions.
- Editing the same information **during** execution (on the exercise screen) only changes that session's snapshot — the original Workout is not modified (see [Database Schema](../technical/database-schema.md)).

## Exercise catalog (picker)

The "add exercises" action opens a local exercise catalog, with a searchable list and filters by muscle group/equipment. Each item shows the name (in the selected language) and a thumbnail image; tapping an exercise opens a preview with more detail before confirming the addition to the Workout.

### Implementation notes

The catalog itself (`ExerciseCatalog`, `ExerciseCard`, `ExerciseImage`, `EmptyState` — see [Architecture](../technical/architecture.md)) was built in [implementation step 7](../process/implementation-roadmap.md), ahead of Workout CRUD, so it's a self-contained, reusable browse/search/preview component. It's temporarily surfaced as the whole Workout tab so it's reachable and testable before Workout CRUD (step 8) exists. Step 8 replaces the tab's content with the real Workout list and reuses this same component as the "add exercises" picker, adding the "confirm add to Workout" action the preview doesn't have yet.

Search matches the exercise name in any of the three languages (not just the current UI language) — filtering by muscle group (`body_part`) and equipment uses the dataset's own values directly, not a curated/translated list.

This same catalog is reused during workout execution (see [Workout Execution](workout-execution.md), "Adding exercises mid-session") and satisfies the "view exercises" offline requirement (see [Architecture](../technical/architecture.md)).

## Deleting a Workout referenced by Programs

When deleting a Workout, show a confirmation popup listing which Programs use that Workout in any of their days, if any.

If any of those Programs has an active schedule (see [Schedule](schedule.md)), the popup must also warn about that explicitly.

On confirming the deletion, every Program day that referenced the deleted Workout automatically becomes a Rest Day, preserving the Program's total day count.
