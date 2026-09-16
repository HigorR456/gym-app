# Database Schema

Design the SQLite schema using migrations.

Tables must be normalized enough to allow future evolution.

## Required tables (at minimum)

- `exercises`
- `workouts`
- `workout_exercises`
- `workout_sets`
- `programs`
- `program_days`
- `scheduled_programs`
- `workout_sessions`
- `session_exercises`
- `session_sets`
- `app_settings`

Avoid unnecessarily duplicating exercise catalog data.

Clearly separate:

- **Exercise catalog**
- **User workout configuration**
- **Workout execution/history**

Editing weight, reps, rest, or adding/removing sets and exercises **during execution** of a workout must only change execution data (`session_exercises`/`session_sets`), never the Workout's configuration data (`workout_exercises`/`workout_sets`) — see [Workout](../features/workout.md).

## Minimum required fields (beyond the table name)

- `workout_sessions`: needs a status field (e.g. `in_progress` / `completed` / `discarded`) and start/end timestamps, to support session recovery and discarding (see [Workout Execution](../features/workout-execution.md)) and the robust timer (see [Business Rules](business-rules.md)).
- `scheduled_programs`: needs a status field (e.g. `active` / `archived`), the current cycle position, the starting day chosen at creation, and a nullable end date (for continuous/infinite programs — see [Schedule](../features/schedule.md)).

## Session history

The architecture must store completed sessions so that a history/stats screen can be built in the future.

Even if the first version has no dedicated History screen, the data must be persisted correctly.

Record at least:

- session
- Workout
- Program, when applicable
- start date/time
- end date/time
- total duration
- exercises performed
- sets
- weight
- reps/time
- configured/actual rest

Past (ended/deleted) schedules follow the same principle — no dedicated browsing screen in v1, but data must be persisted correctly (see [Schedule](../features/schedule.md)).

## Critical failure handling

- **Migration failure**: if a migration fails during an app update, the app must not become permanently inaccessible — there must be a fallback/recovery mechanism (e.g. reverting to the previous schema version, or an error screen with an option to reset local data).
- **Dataset import failure**: if the initial import of `exercises.json`/images fails or is interrupted (see [Implementation Roadmap](../process/implementation-roadmap.md), step 5), the app must detect an incomplete catalog and re-run the import before allowing normal use, since Workouts and Programs depend on the catalog existing.
