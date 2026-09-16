# Delivery Scope & Future Roadmap

## MVP delivery

Deliver a functional Expo/React Native app with:

- TypeScript code
- working SQLite
- migrations
- integrated exercise dataset
- integrated WebP images
- EN/ES/DE
- NativeWind
- `@react-native-vector-icons`
- full navigation
- Workouts
- Programs
- Schedule
- Start
- workout execution
- timers
- offline persistence
- required RepDB attribution

## Designed for future extension

The project must be organized to allow, in the future, without a full rewrite of the domain layer:

- cloud sync
- login
- multiple devices
- statistics
- advanced history
- load progression
- a system notification styled like Android's native stopwatch for the rest/session timer (live count via Foreground Service/Chronometer, Pause/Skip/mark-set-complete actions, expand/collapse, tap to reopen the app on the exercise screen — see [Workout Execution](../features/workout-execution.md)), with its own iOS equivalent (Live Activities) to be evaluated separately
- widgets
- Apple Health / Google Health Connect
