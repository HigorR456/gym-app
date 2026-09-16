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

- All user-created tables (`workouts`, `programs`, `scheduled_programs`, `workout_sessions`, and their child tables): client-generated `id` (UUID/ULID, not a local auto-increment), plus `createdAt`/`updatedAt` timestamps — required by [Architecture](architecture.md)'s sync-readiness principle, even though there's no backend yet.
- `workout_sessions`: needs a status field (e.g. `in_progress` / `completed` / `discarded`) and start/end timestamps, to support session recovery and discarding (see [Workout Execution](../features/workout-execution.md)) and the robust timer (see [Business Rules](business-rules.md)).
- `scheduled_programs`: needs a status field (e.g. `active` / `archived`), the current cycle position, the starting day chosen at creation, and a nullable end date (for continuous/infinite programs — see [Schedule](../features/schedule.md)). This status field is that entity's own soft-delete/soft-cancel mechanism — it doesn't also need a generic `deletedAt`.

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

## Implementation notes

- Schema lives in `src/data/sqlite/migrations/`, one file per version (`0001_initial_schema.ts`, ...), run through a small `PRAGMA user_version`-based runner (`src/data/sqlite/migrations/index.ts`) on app start via `SQLiteProvider`'s `onInit` (see [Architecture](architecture.md), "App bootstrap"). Migrations are append-only — never edit one that already shipped.
- All timestamps (`created_at`, `updated_at`, `started_at`, `ended_at`, schedule `start_date`/`end_date`) are stored as ISO 8601 `TEXT`, not SQLite's numeric datetime — sortable, unambiguous, portable to a future backend.
- Column names are `snake_case`; the `id`/`createdAt`/`updatedAt` naming from [Architecture](architecture.md) is the domain-layer (TypeScript) convention — the SQLite repository layer is responsible for mapping between the two, not the domain.
- Foreign key policy (enforced via `PRAGMA foreign_keys = ON`): child rows that only exist as part of their parent (e.g. `workout_exercises`/`workout_sets` under a `workout`) use `ON DELETE CASCADE`. Cross-entity references that the spec requires explicit app-level handling for before the referenced row can go — deleting a `Workout` referenced by `program_days` (see [Workout](../features/workout.md)), deleting a `Program` with an active schedule (see [Program](../features/program.md)) — use no action, so a raw delete that skips the required app logic fails loudly instead of silently corrupting state. `workout_sessions`' links back to the workout/program/schedule it came from use `ON DELETE SET NULL`, since history must outlive them.

## Critical failure handling

- **Migration failure**: if a migration fails during an app update, the app must not become permanently inaccessible — there must be a fallback/recovery mechanism (e.g. reverting to the previous schema version, or an error screen with an option to reset local data).
- **Dataset import failure**: if the initial import of `exercises.json`/images fails or is interrupted (see [Implementation Roadmap](../process/implementation-roadmap.md), step 5), the app must detect an incomplete catalog and re-run the import before allowing normal use, since Workouts and Programs depend on the catalog existing.
