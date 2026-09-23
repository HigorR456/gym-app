# Architecture: Local-First / Offline-First

This Expo/React Native project must follow a **Local-First / Offline-First** architecture, prepared to add a backend and sync in the future without rewriting the domain layer or the UI.

## Principle

The local database is the app's source of truth. Use `expo-sqlite`.

All core features must work 100% offline:

- create workout
- edit workout
- delete workout
- create program
- edit program
- delete program
- schedule a program
- start/run a workout
- log sets
- change weight
- change reps
- change time
- log rest
- view history
- view calendar
- view exercises

Don't depend on an API or internet connection for any of these operations.

## Layered architecture

Keep a clear separation between layers:

```text
UI
 ↓
Hooks / Application
 ↓
Use Cases
 ↓
Domain
 ↓
Repository Interfaces
 ↓
Repository Implementations
 ↓
SQLite
```

The UI must **never** access `expo-sqlite` directly. Avoid putting complex business logic inside React components.

### Responsibilities

- `screens`: screen composition and user interaction
- `components`: reusable presentational components
- `hooks`: the connection between UI and application/use cases — hooks must reactively reflect writes made elsewhere (e.g. a hook backing the Schedule screen must re-read after a write from the Start screen's cancellation flow), not just fetch once on mount
- `use-cases`: application operations
- `domain`: entities, types, and business rules
- `repositories`: persistence contracts/interfaces
- `data/sqlite`: repository implementations using `expo-sqlite`
- `i18n`: internationalization
- `lib`: generic utilities

## Project structure

Use a combination of **feature-based organization + a domain layer**, without over-applying DDD or creating unnecessary abstractions.

A recommended starting structure:

```text
src/
├── app/                  # Expo Router route files only — see note below
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── program.tsx
│       ├── start.tsx
│       ├── schedule.tsx
│       └── settings.tsx
│
├── providers/
│   └── AppProviders.tsx
│
├── features/
│   ├── workouts/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── programs/
│   ├── exercises/
│   ├── schedule/
│   ├── history/
│   └── calendar/
│
├── domain/
│   ├── workout/
│   │   ├── entities.ts
│   │   ├── rules.ts
│   │   ├── types.ts
│   │   └── use-cases/
│   │
│   ├── program/
│   ├── schedule/
│   └── exercise/
│
├── data/
│   └── sqlite/
│       ├── database.ts
│       ├── migrations/
│       ├── repositories/
│       └── ...
│
├── components/
│   ├── ExerciseCard/
│   ├── WorkoutCard/
│   ├── SetRow/
│   ├── Timer/
│   ├── RestTimer/
│   ├── ConfirmationModal/
│   ├── ExerciseImage/
│   ├── EmptyState/
│   └── ScheduleProgramForm/
│
├── i18n/
│
└── lib/
    ├── date/
    ├── validation/
    └── utils/
```

Adjust this structure if a better organization emerges for the actual codebase, but preserve the architectural principles.

**Note on `app/`**: because Expo Router is file-based (every file under `app/` becomes a route), `app/` must contain route files only — layouts and screens. That's why `providers/` lives as a sibling of `app/`, not nested inside it as originally sketched: a `providers/` folder inside `app/` would itself be picked up as routable. Non-route helpers always live outside `app/`.

Import from `src/` using the `@/` path alias (e.g. `@/lib/theme`, `@/providers/AppProviders`) instead of relative `../../..` chains — configured once in `tsconfig.json`.

## Repository pattern

The domain/application layer must depend on **interfaces**, never directly on SQLite.

Example:

```ts
export interface WorkoutRepository {
  create(workout: Workout): Promise<void>;
  update(workout: Workout): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Workout | null>;
  findAll(): Promise<Workout[]>;
}
```

Implemented as:

```text
WorkoutRepository
       ↑
       │
SQLiteWorkoutRepository
```

The domain must not know the implementation uses SQLite. This is required so that sync/a backend can be added later without changing use cases or business rules.

Repositories should be organized **per domain concept, not necessarily 1:1 with tables**. For example, a `ScheduleRepository` spans `scheduled_programs` plus the derived reads it needs (current day state, calendar heatmap — see [Schedule](../features/schedule.md)), instead of being split across several table-shaped repositories that the domain would then have to recombine itself.

## Use cases

For meaningful operations, prefer explicit use cases, e.g.:

```text
domain/workout/use-cases/
├── createWorkout.ts
├── updateWorkout.ts
├── deleteWorkout.ts
├── logSet.ts
├── finishWorkout.ts
└── ...
```

Conceptual example:

```ts
class LogSet {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
  ) {}

  async execute(input: LogSetInput) {
    const workout = await this.workoutRepository.findById(input.workoutId);

    if (!workout) {
      throw new Error('Workout not found');
    }

    workout.logSet(input.exerciseId, input.set);

    await this.workoutRepository.update(workout);
  }
}
```

Don't create services that just pass calls through between UI and a repository. Only introduce an abstraction when it carries real responsibility.

## Domain layer: pure functions first

The riskiest logic in this app isn't CRUD — it's the scheduling cycle engine (see [Schedule](../features/schedule.md)): cycle math, the automatic slide on a missed checkout, the app-open reconciliation, and the calendar heatmap derivation. This logic must be implemented as **pure functions** (state + current time in, new state out), with no I/O — so it can be unit-tested without a database, an emulator, or React Native at all. [Implementation Roadmap](../process/implementation-roadmap.md) already isolates this as its own step ("scheduling engine (domain)") before the Schedule screen's UI — that isolation only pays off if the engine is actually implementation-agnostic.

The same applies to timer math (see [Business Rules](business-rules.md)): elapsed/remaining time must be computed from stored timestamps by a shared pure function, used by both the `Timer` and `RestTimer` components (put it in `lib/date`, not duplicated inside each component).

## App bootstrap

Two independent checks must run when the app launches or resumes to the foreground (driven by `AppState` transitions, not just cold start):

1. **Schedule reconciliation** — comparing today's date against the active schedule (see [Schedule](../features/schedule.md), "Reconciling schedule state on app open").
2. **In-progress session recovery** — checking for a resumable `workout_sessions` row (see [Workout Execution](../features/workout-execution.md), "Resuming or discarding an in-progress session").

These are unrelated concerns and must not block each other or the UI — run them independently, not as a single monolithic "on app start" function.

## Preparing for future sync

Even without a backend now, model entities so they can be synced later:

- Use client-generated IDs, preferably UUID/ULID:

  ```ts
  id: string;
  ```

  Don't rely on locally auto-incrementing IDs for entities that may be synced later.

- Important entities should also have:

  ```ts
  createdAt: Date;
  updatedAt: Date;
  ```

- Consider support for:

  ```ts
  deletedAt: Date | null;
  ```

  to allow soft deletes and future sync. (Note: some entities already have a more specific status field for their own reasons — e.g. a schedule's `active`/`archived` status, see [Database Schema](database-schema.md) — which serves the same "never hard-delete" principle without needing a generic `deletedAt` on top.)

Don't build an actual sync system now. Just avoid decisions that would make it harder to add later.

## SQLite

Centralize the database setup:

```text
data/sqlite/
├── database.ts
├── migrations/
├── repositories/
└── ...
```

Use versioned migrations. Don't scatter SQL across the app — only SQLite repositories should know about tables, queries, and `expo-sqlite` itself. Everything else works with entities, types, and interfaces.

## Reusable components

Build reusable components for recurring elements, including:

- `ExerciseCard`
- `WorkoutCard`
- `SetRow`
- `Timer`
- `RestTimer`
- `ConfirmationModal`
- `ExerciseImage`
- `EmptyState`
- `ScheduleProgramForm` — shared between the Schedule and Start features/screens (see [Schedule](../features/schedule.md) and [Start](../features/start.md))
- `CurrentDayCard` — the active schedule's current day, shown prominently on both the Schedule and Start screens (see [Schedule](../features/schedule.md) and [Start](../features/start.md))

Components should be focused on presentation and interaction. Avoid putting business logic or SQLite queries inside them.

## TypeScript

- Use TypeScript strictly.
- Avoid `any`.
- Don't use `as` casts just to silence type errors.
- Prefer explicit types and inference where appropriate.
- Keep domain types independent from SQLite-specific or UI-specific types.

## Core architectural rule

Always respect:

```text
UI
 ↓
Hooks / Application
 ↓
Use Cases
 ↓
Domain
 ↓
Repository Interface
 ↓
SQLite Repository
 ↓
expo-sqlite
```

Never:

```text
Component
 ↓
expo-sqlite
```

or:

```text
Screen
 ↓
SQL query
```

or:

```text
Domain
 ↓
expo-sqlite
```

## Simplicity principle

This should not be an overly "enterprise" architecture. Don't implement complex DDD, factories, aggregates, specifications, event buses, or abstractions without a concrete need.

Priorities, in order:

1. simple code
2. easy maintenance
3. real offline-first behavior
4. clear separation of responsibilities
5. domain independent from infrastructure
6. the ability to add sync later

Whenever an abstraction doesn't bring a concrete benefit, prefer the simpler solution. Before adding a new layer, evaluate whether it's actually necessary.

## End goal

The architecture must let us have, today:

```text
Expo
 ↓
Local SQLite
```

and evolve later into:

```text
Expo
 ↓
Use Cases
 ↓
Repository
 ↓
SQLite
 ↕
Sync Engine
 ↕
Backend API
 ↓
PostgreSQL
```
