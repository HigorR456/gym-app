# Feature: Start Screen

The **Start** screen is the entry point for starting a workout.

If there's an active schedule, its current day must be the first option, shown prominently/emphasized — the pending workout if today is a workout day, or a **Rest** indicator (no action) if today is a rest day (see [Schedule](schedule.md)).

If the user has no Program selected, show an option for:

**Choose Program**

This action must open the same schedule-creation component used on the Schedule screen (see [Schedule](schedule.md)) — the same fields, including Program, cycle starting day, and execution period — as a component shared between the two screens (`ScheduleProgramForm`, see [Architecture](../technical/architecture.md)), without forcing the user to leave the Start screen.

Below that, show the list of all Workouts created by the user. The user can start any Workout directly, even without a Program.

There are therefore two flows:

### Start via Program

Start → Program → Today's Workout → Exercises

### Start a Workout directly

Start → Workout → Exercises

## Starting a workout while a schedule is active

Every workout session is recorded in history regardless of whether it's tied to a Program or an active schedule (see [Database Schema](../technical/database-schema.md)) — this applies unconditionally, whether the session was started via a Program or directly as a standalone Workout.

If there's an active schedule and the user starts, directly from the Workout list, anything other than what the schedule has planned for today, show a confirmation warning before starting: the user already has an active schedule, and starting this workout instead will **cancel the current schedule entirely** (not just skip today's day — see [Schedule](schedule.md), "Only one active schedule"). This applies both on a workout day (picking a different Workout than the one pending) and on a rest day (choosing to train instead of resting). The user can cancel out of the warning and keep the schedule, or confirm and proceed.

If confirmed, the active schedule is cancelled (same effect as deleting it) and the chosen Workout starts as a standalone session.

If the picked Workout is exactly the one currently pending in the active schedule, no warning is shown — the session proceeds normally, and completing it fulfills that scheduled day (see [Workout Execution](workout-execution.md), "Finishing the workout").

## Multiple sessions on the same day

Once today's schedule day is already resolved — the scheduled workout has been checked out, or there's no active schedule at all — starting another Workout the same day never shows the cancellation warning and never affects any previous session. There's nothing left to lose: the schedule's cycle pointer already advanced (or there was nothing to advance). The extra session is simply recorded as an additional, independent entry in history, same as any other session (see [Database Schema](../technical/database-schema.md)). Earlier sessions from the same day are never deleted or replaced.
