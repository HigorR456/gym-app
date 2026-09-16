# Feature: Tab Navigation

The app must have a bottom tab bar.

The main tabs must be:

- Workout
- Program
- [Dumbbell]
- Schedule
- Settings

The center button must have a **dumbbell** icon and open the workout start/execution screen (see [Start](start.md)).

Use `@react-native-vector-icons` for icons (see [Stack](../technical/stack.md)). Don't use external images to represent UI icons when an appropriate icon already exists in the library.

## Implemented icons (FontAwesome6, solid style)

- Workout — `list-check`
- Program — `layer-group`
- Start (dumbbell) — `dumbbell`, rendered slightly larger than the other tab icons since it's the primary action
- Schedule — `calendar-days`
- Settings — `gear`
