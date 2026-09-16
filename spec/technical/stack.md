# Tech Stack

## Required stack

- React Native
- Expo
- TypeScript
- Expo Router for navigation
- expo-sqlite for local persistence
- NativeWind for styling
- Theme: black background with dark gray variants, white text, yellow primary color
- `@react-native-vector-icons` for icons
- Expo SDK 51 or later (minimum version required for native migration support in `expo-sqlite`, needed by [Database Schema](database-schema.md))
- An internationalization system compatible with React Native, with initial support for:
  - EN
  - ES
  - DE

## Constraints

- The app must work fully offline for its core functionality.
- Do not depend on an external API for basic app functionality.

## Icon library decision

`react-native-vector-icons` is used instead of `@expo/vector-icons`, despite the latter being more idiomatic in an Expo-managed project (bundled, no native linking required). This is intentional: `@expo/vector-icons` is expected to be deprecated soon, so `react-native-vector-icons` was chosen for longer-term support.

Known trade-off: `react-native-vector-icons` itself now warns on install that it's moving to a per-icon-family package model (see its migration guide). Revisit this choice if that migration becomes disruptive before the app reaches Tab Navigation ([navigation.md](../features/navigation.md)), where icons are first used.
