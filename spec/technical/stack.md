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

`@react-native-vector-icons` (the scoped, per-icon-family package line — e.g. `@react-native-vector-icons/fontawesome6`) is used instead of `@expo/vector-icons`. This is intentional: `@expo/vector-icons` is expected to be deprecated soon, and `@react-native-vector-icons` is the maintainer-endorsed successor going forward, with direct `expo-font` integration (loads via an Expo config plugin — no manual `useFonts` call, no native prebuild needed for Expo Go).

Note the exact package name: the unscoped `react-native-vector-icons` (no `@` scope) is the legacy package being migrated *away from* — it is not what "`@react-native-vector-icons`" in this spec refers to.

Currently installed: `@react-native-vector-icons/fontawesome6` (used for all Tab Navigation icons, see [navigation.md](../features/navigation.md)). Add other per-family packages only when a needed icon genuinely isn't in FontAwesome6.

## Theme tokens

The theme (black background, dark gray variants, white text, yellow primary) is implemented as NativeWind/Tailwind color tokens in `tailwind.config.js`:

- `background` — `#000000`
- `surface` (`DEFAULT`/`100`/`200`) — `#171717` / `#262626` / `#404040` (the dark gray variants)
- `text` — `#FFFFFF`
- `primary` — `#FACC15`

These exact values are a provisional baseline so the app renders correctly from NativeWind setup onward — not a final design decision. Revisit during UX refinement ([implementation-roadmap.md](../process/implementation-roadmap.md), step 18) if real brand/design input changes them; if it does, only `tailwind.config.js` needs to change, since screens should reference these tokens (e.g. `bg-background`, `text-primary`) rather than hardcoded colors.
