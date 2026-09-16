# Architecture: Local-First / Offline-First

## Principle

The local database is the app's primary source of truth. Use `expo-sqlite`.

All core operations must work without internet:

- create workout
- edit workout
- delete workout
- create program
- edit program
- delete program
- schedule a program
- run a workout
- log sets
- change weight
- change reps
- change time
- log rest
- view history
- view calendar
- view exercises

## Future-proofing

The architecture must allow adding backend sync in the future without rewriting the domain layer.

## Layering

Clearly separate:

- UI
- navigation
- domain / business rules
- repositories / data access
- SQLite
- i18n
- reusable components

Avoid accessing SQLite directly from UI components.

## Reusable components

Build reusable components for elements such as:

- ExerciseCard
- WorkoutCard
- SetRow
- Timer
- RestTimer
- ConfirmationModal
- ExerciseImage
- EmptyState
- ScheduleProgramForm (schedule creation — shared between the Schedule and Start screens, see [Schedule](../features/schedule.md) and [Start](../features/start.md))

## TypeScript

- Use TypeScript strictly.
- Avoid `any` whenever possible.
- UI components must not contain complex business logic.
