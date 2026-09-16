# Feature: Workout Execution

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
