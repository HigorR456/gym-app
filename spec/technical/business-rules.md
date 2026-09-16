# Business Rules

These rules apply across the whole app and take priority over anything that seems to conflict with them in a feature file.

1. The app must work without an internet connection once installed.
2. The exercise catalog must be available offline.
3. Exercise images must be available offline.
4. SQLite must be the local source of truth.
5. Don't depend on API calls to start or run workouts.
6. All workout operations must be persisted locally.
7. A workout session must not be lost if the app is temporarily backgrounded.
8. Timers must use timestamps/elapsed time robustly, avoiding sole reliance on `setInterval`.
9. The rest timer and the session-wide timer are independent of each other.
10. Session state must be recoverable if the app is closed unexpectedly, whenever technically possible.
11. The selected language must persist.
12. Use TypeScript strictly.
13. Avoid `any` whenever possible.
14. UI components must not contain complex business logic.

See [Architecture](architecture.md) for the required reusable components list.
