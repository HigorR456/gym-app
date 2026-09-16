# Implementation Roadmap

Build incrementally:

1. Expo + TypeScript setup
2. NativeWind
3. Expo Router navigation
4. SQLite + migrations
5. Import the exercise dataset
6. i18n system
7. Exercise catalog
8. Workout CRUD (basic, without the schedule-related warnings yet)
9. Program CRUD (basic, without the schedule-related warnings yet)
10. Scheduling engine (domain): cycle model, automatic slide, skip day, states — before the Schedule screen UI
11. Schedule screen (UI) + the deletion/edit warnings for Workout/Program with an active schedule (revisiting steps 8 and 9)
12. Start
13. Workout execution
14. Timers
15. Session persistence/recovery (AppState, boot-time check, resume/discard an in-progress session)
16. History/session saving
17. Settings/About
18. UX refinement
19. Tests
20. Full offline verification

The deletion/edit warnings from [Workout](../features/workout.md) and [Program](../features/program.md) depend on the scheduling engine (step 10) existing — that's why those steps happen in two passes (basic CRUD first, warnings after step 10).

Each step must keep the app runnable.

Before creating new abstractions, verify they're actually necessary.

Prioritize a simple, modular, easy-to-maintain implementation.
