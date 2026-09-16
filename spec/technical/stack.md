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

## Open item

`@react-native-vector-icons` is the bare React Native package. In an Expo-managed project, `@expo/vector-icons` (bundled with Expo, no native linking required) is the more idiomatic equivalent and wraps most of the same icon families. This was flagged during spec review — confirm this choice is intentional before implementation.
