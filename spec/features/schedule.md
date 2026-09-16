# Feature: Schedule Screen

> This is the most complex feature in the app. Read this file in full before touching scheduling logic.

The **Schedule** screen presents a calendar.

The user must be able to:

1. Choose a Program.
2. Choose which day of the Program's cycle the schedule starts from (e.g. start on Day 2 — "Back" — instead of Day 1).
3. Choose the start date.
4. Define the execution period: an end date (fixed-length program) **or** no end date (continuous/infinite program).
5. View planned days.
6. View days already completed.
7. View rest days.
8. View missed (overdue) workout days.
9. Change the schedule's end date at any time (extend or shorten the period).
10. Delete the current schedule at any time.
11. Manually skip the workout day that is currently pending, advancing the cycle immediately without doing the workout.
12. View a heatmap of actual training activity on the calendar, independent of the schedule (see "Calendar heatmap" below).

## Cycle model

Scheduling a Program works as a **repeating cycle**, not a fixed list of dates:

- The Program has N days (e.g. 10). On completing Day N, the cycle restarts at Day 1.
- The cycle repeats until the end date (fixed-length program) or indefinitely (continuous/infinite program).
- Rest days don't require checkout: the cycle automatically advances to the next day once the rest day's date passes.
- Workout days require checkout (finishing the session) for the cycle to advance. Until the day's workout is finished, it remains the next pending workout.

## Only one active schedule

There must be at most **one** active scheduled Program at a time.

If the user tries to create a new schedule while one is already active, the app must block the action and warn that an active schedule already exists, directing the user to either end it (by changing the end date to a past date) or delete the current schedule before creating a new one.

Deleting a schedule ends the Program's link to the Schedule immediately, freeing up the slot for a new schedule — but it never erases history: workout sessions already completed under that schedule remain saved (see [Database Schema](../technical/database-schema.md), "Session history"). Past (ended/deleted) schedules have no dedicated browsing screen in v1, but the data must still be persisted correctly, the same way session history is.

A schedule can end in three ways: editing the end date to a past date, explicit deletion (both on this screen), or starting a workout that isn't what the schedule has planned for today — including training instead of resting on a rest day — with confirmation (see [Start](start.md), "Starting a workout while a schedule is active").

## Manually skipping a day

Besides the automatic slide from a missed checkout (below), the user can deliberately skip the workout day that is currently pending, through an explicit "Skip day" action available wherever that pending day is shown (Schedule and Start).

Skipping a day advances the cycle immediately to the next day — the same forward effect as the automatic slide, but triggered by the user on the spot instead of waiting for a missed checkout. The day is recorded with the **skipped** state, distinct from a day that simply wasn't finished (see "States" below).

## Automatic reschedule on missed checkout

If the user doesn't finish (checkout) the scheduled day's workout, that workout day is automatically rescheduled to the next day, and the entire remaining cycle sequence slides forward by one day.

Example:

The user doesn't finish day 20's workout. The workout planned for day 20 becomes day 21's workout. The workout planned for day 21 moves to day 22, and so on — the whole remaining sequence slides.

This slide is cumulative: if the user fails to finish 3 workout days in a row, the entire remaining sequence slides by 3 days.

The period's end date (for fixed-length programs) **does not slide** along with it. If the end date is reached before all planned days have been completed, the schedule simply ends there — the remaining days are never performed.

Rest days are not affected by this slide: they are always automatically skipped on the date they occur, regardless of how many workouts are overdue.

## Reconciling schedule state on app open

The app has no background process — every schedule-state transition described above (the automatic slide on a missed checkout, and a rest day being marked completed) is evaluated **when the app is opened or resumed to the foreground**, by comparing the current local date against the active schedule. This is a separate check from the in-progress session recovery described in [Workout Execution](workout-execution.md).

On each app open, if there's an active schedule:

- Any elapsed rest day (its date has fully passed) is marked **completed** automatically.
- Any elapsed workout day without a checkout is left as **pending/overdue** — it doesn't silently disappear or auto-complete; it keeps waiting for a checkout, which is what drives the cumulative slide described above.

For any given calendar date, an active schedule maps it to exactly one of: a **workout day**, a **rest day**, or **unscheduled** (`null`, if the date falls outside any active schedule's coverage — e.g. before it started, or after it ended).

This single-value-per-date mapping is about the schedule's own state (there is only ever one cycle pointer), not about session history. Multiple workout sessions can still happen on the same calendar date without conflict — see [Start](start.md), "Multiple sessions on the same day".

## Editing the schedule's start (before it effectively begins)

The cycle starting day (item 2 — e.g. starting on Day 2 "Back" instead of Day 1 "Chest") and the start date (item 3) can only be edited **while today's date is still the schedule's start date**, and no checkout has happened yet that day. As soon as the current date moves past the start date — even if nothing was ever done that day — the schedule is considered to have begun, and both fields lock.

Once locked, there is no "change the start" action anymore. To change them after that point, the user must first end the current schedule — either by changing the end date to a past date, or by deleting the schedule — and then create a new one. This is necessary because only one schedule can be active at a time.

## States

Each scheduled day must distinguish between:

- **planned** — future workout, date hasn't arrived yet
- **pending/overdue** — the date has passed and the workout wasn't finished; awaiting checkout, doesn't slide until that happens
- **completed** — checkout done
- **skipped** — the user deliberately skipped it, without doing the workout
- **rest** — automatically skipped by the system, no user action

The logic must always preserve the history of workouts already completed, even when the cycle slides because of unfinished days.

## Calendar heatmap

The calendar must highlight actual training activity, not just the schedule's plan — similar in spirit to a GitHub-style contribution graph, but laid out as a real calendar (not a grid of squares), using fill color intensity per day:

- **Light yellow** — more than 1 workout session completed that day.
- **Yellow** — exactly 1 workout session completed that day.
- **Dark yellow** — a rest day with no workout session (as planned).
- **Black** — no action: no session happened and the day isn't a rest day. This covers unscheduled days, a scheduled workout day that's still pending/overdue, and a **skipped** day — all render the same as a day with no activity, with no distinct color or outline for missed vs. skipped vs. never-scheduled.

The fill color is driven by what actually happened that day, not by what was scheduled: a day with one or more completed sessions is always yellow/light yellow, even if the schedule had it marked as rest (see [Start](start.md), "Multiple sessions on the same day" and "Starting a workout while a schedule is active"). Dark yellow only applies when nothing was done and the day was planned as rest.

Days that are part of the active schedule's future coverage (haven't arrived yet) get a **yellow outline** on top of their (black) fill, to visually distinguish "scheduled" from truly unscheduled empty days.

## No pause mechanism

The schedule has no "pause" feature. To handle periods without use (travel, illness, etc.), the user must manually edit the schedule's end date whenever needed, extending the period as necessary.

## Definition of "day"

For all schedule calculations (current day, overdue status, automatic rest-day advance), a "day" is defined by the **device's local date**, rolling over at local midnight.

Known and accepted limitation for the MVP: if the user changes time zones while a schedule is active, the day rollover follows the new time zone automatically, which can cause occasional inconsistencies (e.g. a day being skipped or double-counted).
