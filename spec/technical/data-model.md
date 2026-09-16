# Conceptual Data Model

The app must have at least the following concepts.

## Exercise

An exercise belonging to the catalog.

Example fields:

- id
- name (EN)
- name (ES)
- name (DE)
- description/instructions, when available
- muscle group
- equipment
- image
- other metadata available in the dataset

## Workout

A workout created by the user.

Example: **Push Day**

Contains a sequence of exercises. Each exercise has a set configuration.

A set may have:

- weight
- reps OR duration
- rest time
- completed status

A Workout must allow exercises with different configurations.

## Program

A program is a sequence of days that references Workouts.

A Program may have:

- name
- optional description
- duration in days
- sequence of days
- a Workout associated with each day
- rest days

Example:

```
Day 1 → Push/Pull
Day 2 → Rest
Day 3 → Legs
Day 4 → Rest
```

The format must not be limited to 7 days. It must be possible to create, for example:

- a 3-day program
- a 7-day program
- a 10-day program
- a 30-day program
- any number of days defined by the user

A program day can be:

- a Workout
- a Rest Day
