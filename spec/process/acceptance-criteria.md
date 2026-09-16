# Acceptance Criteria

The app is considered functional when the following are possible.

## Workout

- create a Push Day
- add exercises
- configure sets
- configure weight
- configure reps/time
- configure rest
- edit and delete the Workout
- duplicate the Workout
- delete a Workout referenced by Programs, with the corresponding warning

## Program

- create a program
- add Workouts
- add rest days
- create programs with any number of days
- duplicate the program, with both options (with and without duplicating Workouts)
- edit/delete a Program with an active schedule, with the corresponding warning

## Schedule

- select a Program
- define the start
- view the days on the calendar
- distinguish planned from completed
- change the schedule's end date at any time
- delete the current schedule
- manually skip a day
- verify that a missed checkout correctly slides the remaining sequence
- verify that it's not possible to have 2 active schedules simultaneously
- edit the cycle starting day/start date on the same day the schedule starts, before any checkout
- verify editing the cycle starting day/start date is locked once the current date moves past the start date
- verify rest days are automatically marked completed after they pass, and workout days without checkout stay pending until checked out (reconciled on app open)
- verify the calendar heatmap reflects actual training activity (not just the schedule's plan), with future scheduled days outlined

## Start

- start the selected Program
- select a Program if none is selected
- start a Workout directly
- warn and cancel the active schedule when starting a Workout other than what's scheduled for today, including training on a rest day

## Workout execution

- start the session-wide timer
- view the exercise
- view the image
- edit sets
- complete a set
- start the rest timer
- add/remove 10 seconds
- skip rest
- add/remove sets
- add exercises
- navigate between exercises
- finish the workout
- save the session
- resume an in-progress session after reopening the app
- discard an in-progress session

## Offline

With the device offline, all functionality above must keep working.

## Languages

All main screens must work in:

- EN
- ES
- DE
