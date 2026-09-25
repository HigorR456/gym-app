# Feature: Workout Execution

## Implementation notes (step 13)

`sessionRepository.ts` persists write-through rather than batching everything into a single save at Finish (unlike `WorkoutEditor`'s "replace all on save" — see [Workout](workout.md)): `startSession` immediately snapshots the Workout's current exercises/sets into `session_exercises`/`session_sets` and every later mutation (set edit, mark complete, add/remove set, add exercise) writes straight to SQLite. This is what [Business Rules](../technical/business-rules.md) rules 7 and 10 ("a workout session must not be lost if the app is temporarily backgrounded" / "session state must be recoverable... whenever technically possible") require at the data layer — `useSessionExecution` mirrors each write into local state after persisting, not before. `SessionScreen` (`src/features/session/components/`) is one exercise at a time, matching the header's "Exercise X/Y".

One thing stayed out of scope for this step, on purpose:
- **Boot-time recovery.** Nothing yet offers to resume an `in_progress` session when the app reopens — that's step 15. The session is already safely persisted by then (see above), so step 15 only has to add the "offer to resume" UI on top, not change how sessions are written.

## Implementation notes (step 14, Timers)

Both timers are timestamp-based per [Business Rules](../technical/business-rules.md) rule 8 ("avoid sole reliance on `setInterval`"): a `setInterval` only ever forces a re-render (`lib/useNowTick.ts`), and the displayed value is always recomputed from real timestamps on that render — `Timer` from `now - session.started_at`, `RestTimer` from `now - endAt` (`features/session/hooks/useRestTimer.ts`), where `endAt` is a fixed point in time that "+10 sec"/"-10 sec" shift directly. This means a dropped tick (e.g. the app backgrounding, per rule 7) never desyncs either display — the very next tick recomputes the correct value against the live clock. Rule 9 ("independent of each other") falls out naturally: they're two separate hooks with no shared state.

`Timer` renders in `SessionScreen`'s header, ticking for the whole session. `RestTimer` only starts when a set is marked complete *and* that set has a configured `rest_seconds > 0` (marking a set with no configured rest complete doesn't start a countdown from nothing); un-completing a set never starts or stops it. Reaching zero flips `RestTimer` to an "over" state (different label/border) rather than auto-dismissing, since nothing in this doc says it should disappear on its own — "Skip" is the one way to close it, before or after zero.

Not persisted to SQLite: the rest timer's own in-progress state (whether it's counting, and its current `endAt`) is transient UI state, not part of the session's durable record — it's naturally recovered correctly across backgrounding (see above) but is lost if the app is fully killed, same as the rest of step 15's boot-time recovery scope.

Finishing a session never has to separately "mark the scheduled day completed" — `finishSession` just sets `status`/`ended_at`, and `scheduleRepository.reconcileActiveSchedule`'s existing `hasCheckout` lookup (built in step 11) already reads completed sessions by `scheduled_program_id`, so the schedule picks it up the next time it's reconciled (next app open/resume, or the Start/Schedule screens' own focus-refetch). `startSession`'s caller (`StartScreen`, see [Start](start.md)) decides whether to tag `programId`/`scheduledProgramId` at all, per "Finishing the workout" below.

This covers the full live-execution flow: starting a session, the exercise screen, sets, the rest timer, adding exercises mid-session, navigating between exercises, and finishing the workout.

## Starting a session

On starting a workout, immediately start a **session-wide timer**. This timer keeps running for the entire session.

Then open the exercise execution screen.

### Resuming or discarding an in-progress session

If the app is reopened and there's a session with `in_progress` status (not finished — see [Database Schema](../technical/database-schema.md)), the app must offer to resume directly on the exercise screen, rebuilding state from what was persisted (see [Business Rules](../technical/business-rules.md), session recovery rule).

No automatic expiration for the MVP: an in-progress session stays resumable indefinitely, even after days, until the user either finishes it (see "Finishing the workout" below) or manually discards it.

There must be an explicit **discard session** action (with a confirmation popup) for the user to abandon an in-progress session without finishing it — in that case the session is marked as discarded, and does not count as completed on the Schedule.

## Exercise screen

The exercise screen must show:

### Header

At the top: **Exercise X/Y**

Example: **3/8**, where 3 = current exercise, 8 = total exercises.

The header must also have a **Finish Workout** button. This button must always open a confirmation popup/modal.

The modal must show:

- number of exercises completed
- total session time

And allow:

- continue workout
- finish workout

### Exercise information

Show:

- exercise name
- WebP image
- additional info available in the dataset
- muscle group/equipment, when available

The image must work offline. If a specific exercise's image is missing or fails to load, show a generic placeholder icon instead, without breaking the screen.

## Sets

Right below the exercise info, show the list of sets. Each set must allow:

- editing weight
- editing reps
- editing duration/time
- marking the set as completed

Example:

| Set | Weight | Reps | Status |
|---|---:|---:|---|
| 1 | 60 kg | 10 | done |
| 2 | 60 kg | 10 | done |
| 3 | 65 kg | 8 | pending |

After marking a set as completed:

1. Immediately record the result in local state.
2. Start the rest timer configured for that set.
3. Show the timer in a popup above the tab bar.

## Rest timer

After completing a set, show a rest popup over the interface. The popup must contain:

- countdown
- **Skip** button
- **+10 sec** button
- **-10 sec** button

The user can change the time during the countdown. On reaching zero, the timer must indicate that rest is over.

The session-wide timer keeps running independently of the rest timer.

### Out of MVP scope: system notification

Out of scope for the MVP, but planned for a future version (see [Delivery & Roadmap](../process/delivery-and-roadmap.md)): replace/complement the in-app popup with a system notification styled like Android's native stopwatch — a live count (Chronometer + Foreground Service), with Pause/Skip/mark-set-complete actions, an expandable (collapse/expand) layout, and tapping the notification reopens the app on the exercise screen.

This requires leaving Expo Go (dev client/EAS Build + a native library such as `notifee`), has no direct iOS equivalent (would require Live Activities, a separate implementation), and implies domain logic being reachable from the background too. That's why it's not part of the MVP.

The timestamp-based timer model (see [Business Rules](../technical/business-rules.md)) already lays the groundwork for this future evolution without reworking the domain layer.

## Managing sets

At the bottom of the exercise screen, there must be an action area for:

- adding a set
- removing a set

Adding a set must respect the exercise's default configured values, when available.

## Adding exercises mid-session

The user must be able to add more exercises to the workout during execution. The action must open the local exercise catalog (same component described in [Workout](workout.md)).

The user picks an exercise and it's added to the current session. This added exercise is only part of that session's snapshot — the original Workout is not changed (see [Database Schema](../technical/database-schema.md)).

Execution continues normally.

## Navigating between exercises

There must be a navigation bar, always visible on the exercise screen, allowing:

- previous exercise
- next exercise

Example: **← Previous | 3/8 | Next →**

The user must not need to go back to another screen to navigate between exercises.

## Finishing the workout

Selecting **Finish Workout** must always show a confirmation.

Conceptual example:

> Finish workout?
>
> You completed 7 of 8 exercises.
>
> Total time: 42:18

Options: Cancel / Finish.

On confirming:

- save the session to SQLite
- record completed exercises
- record completed sets
- record weight
- record reps/time
- record session duration
- update the Schedule, if applicable
- mark the corresponding scheduled day as completed

A session updates the Schedule when either:

- it was launched via the Program → Today's Workout flow, or
- it was started directly from the Start screen's Workout list, and the chosen Workout is exactly the one currently pending in the active schedule (see [Start](start.md), "Starting a workout while a schedule is active").

Starting any other Workout directly while a schedule has a pending day triggers a cancellation warning instead (see [Start](start.md)) — so there's no scenario where an unrelated workout silently completes or corrupts the active schedule.
