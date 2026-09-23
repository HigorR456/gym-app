# Feature: Workout Screen

The **Workout** screen shows the Workouts created by the user.

## Implementation notes (CRUD, step 8)

- Reordering exercises uses simple up/down controls, not drag-and-drop — functionally equivalent for this MVP, much less implementation risk than a gesture-based reorder.
- Editing (renaming, adding/removing/reordering exercises, changing sets) always saves as "replace all exercises for this Workout" in one transaction, rather than diffing against the previous state — simpler and still correct, since a Workout's exercises/sets aren't referenced by anything outside the Workout itself. This does *not* apply to `workout_sessions`, which snapshot a Workout's exercises/sets at execution time and are never touched by a later edit (see [Database Schema](../technical/database-schema.md)).
- The "confirm add to Workout" step promised in "Exercise catalog (picker)" above is `ExerciseCatalog`'s `onSelect` prop — the catalog opens as a modal from the Workout editor and adds the picked exercise to the in-progress (unsaved) edit, not directly to SQLite.
- Deleting a Workout is a plain delete for now — the "referenced by Programs" warning below is deferred to [implementation step 11](../process/implementation-roadmap.md), once Programs (step 9) and the scheduling engine (step 10) exist to check against.

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

## Icon selection

Not in the original scope, added afterwards for visual identification across the Workout list and Program day rows.

Creating/editing a Workout, in addition to its name, includes a picker for an icon from a fixed catalog (`src/lib/icons.ts`'s `ICON_OPTIONS`, drawn from `react-native-vector-icons` families already in the app — Ionicons, MaterialDesignIcons, FontAwesome5/6, MaterialIcons, SimpleLineIcons). The default selection is `weight-lifter` (MaterialDesignIcons).

The icon renders inside a rounded-square swatch: primary/yellow background, black icon (`IconSwatch`, `variant="workout"`). It's shown to the right of the Workout's title in the Workout list, and next to any Program day that references that Workout (see [Program](program.md), "Icon selection") — never on a rest day, so the two states stay visually distinct at a glance.

## Deleting a Workout referenced by Programs

When deleting a Workout, show a confirmation popup listing which Programs use that Workout in any of their days, if any.

If any of those Programs has an active schedule (see [Schedule](schedule.md)), the popup must also warn about that explicitly.

On confirming the deletion, every Program day that referenced the deleted Workout automatically becomes a Rest Day, preserving the Program's total day count.
