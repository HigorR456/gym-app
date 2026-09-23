# Feature: Program Screen

The **Program** screen shows the training programs created by the user.

It must be possible to:

- create a program
- edit a program
- delete a program
- duplicate a program
- add/remove days
- add a Workout to a day
- mark a day as rest
- reorder days
- view the program's total duration

The program must accept an arbitrary number of days.

Example:

| Day | Type |
|---|---|
| 1 | Push |
| 2 | Rest |
| 3 | Legs |
| 4 | Rest |
| 5 | Pull |
| 6 | Rest |
| 7 | Full Body |

## Duplicating a program

When the user taps "duplicate program", show a popup with two clear options:

1. **Duplicate program** (without duplicating Workouts) — preferred option, shown first and visually emphasized (e.g. a *contained*-style button). The duplicated Program references the **same** Workouts as the original — editing a Workout affects both Programs.
2. Duplicate program **and Workouts too** — secondary option, less visually emphasized. Creates an independent copy of every referenced Workout, so the duplicated Program shares no Workouts with the original.

Note for future versions: the "and Workouts too" option is a candidate to become a premium feature.

## Icon selection

Not in the original scope, added afterwards for visual identification across the Program list.

Creating/editing a Program, in addition to its name and optional description, includes a picker for an icon from the same fixed catalog Workouts use (see [Workout](workout.md), "Icon selection"). The default selection is `weight-lifter` (MaterialDesignIcons).

The icon renders inside a rounded-square swatch styled distinctly from a Workout's: black background, primary/yellow border and icon (`IconSwatch`, `variant="program"`) — so a Program's own icon is never visually confused with a referenced Workout's icon shown inside it. Shown to the right of the Program's title in the Program list.

## Editing/deleting a Program with an active schedule

If the Program has an active schedule (see [Schedule](schedule.md)), editing its structure (adding/removing/reordering days, marking/unmarking a day as rest) or deleting the Program must always show a confirmation popup warning that an active schedule is linked to it.

Deleting a Program with an active schedule also ends the corresponding schedule (archived/cancelled) — see [Schedule](schedule.md).

Changing the number of days of a Program with an active schedule recalculates the current cycle position (the day the schedule is on) modulo the new day count, so it stays within valid bounds.
