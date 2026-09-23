// Catalog of selectable icons for Workouts/Programs (not in the original
// spec — see spec/features/workout.md and spec/features/program.md, "Icon
// selection"). Every entry comes from a react-native-vector-icons family
// already used in this app, picked from https://oblador.github.io/react-native-vector-icons/.
// `id` is what gets stored on the Workout/Program row — stable and
// independent from `name`/`family` so a future catalog reshuffle doesn't
// silently change what's already saved.
export type IconFamily =
  | 'ionicons'
  | 'material-design-icons'
  | 'fontawesome5'
  | 'fontawesome6'
  | 'material-icons'
  | 'simple-line-icons';

export type IconOption = {
  id: string;
  family: IconFamily;
  name: string;
};

export const DEFAULT_ICON_ID = 'weight-lifter';

export const ICON_OPTIONS: IconOption[] = [
  { id: 'barbell', family: 'ionicons', name: 'barbell' },
  { id: 'barbell-outline', family: 'ionicons', name: 'barbell-outline' },
  { id: 'barbell-sharp', family: 'ionicons', name: 'barbell-sharp' },
  { id: 'kettlebell', family: 'material-design-icons', name: 'kettlebell' },
  { id: 'dumbbell', family: 'fontawesome6', name: 'dumbbell' },
  { id: 'weight-lifter', family: 'material-design-icons', name: 'weight-lifter' },
  { id: 'body', family: 'ionicons', name: 'body' },
  { id: 'arm-flex', family: 'material-design-icons', name: 'arm-flex' },
  { id: 'arm-flex-outline', family: 'material-design-icons', name: 'arm-flex-outline' },
  { id: 'seat-legroom-reduced', family: 'material-design-icons', name: 'seat-legroom-reduced' },
  { id: 'running', family: 'fontawesome5', name: 'running' },
  { id: 'bicycle', family: 'fontawesome5', name: 'bicycle' },
  // Requested as "biceps-flexed (Lucide)" — kept inside the
  // react-native-vector-icons families already in use instead of adding a
  // new icon library for one glyph; this FA6 glyph covers the same
  // strength/flex idea without duplicating the arm-flex entries above.
  { id: 'hand-fist', family: 'fontawesome6', name: 'hand-fist' },
  { id: 'human-handsup', family: 'material-design-icons', name: 'human-handsup' },
  { id: 'hand-right', family: 'ionicons', name: 'hand-right' },
  { id: 'jump-rope', family: 'material-design-icons', name: 'jump-rope' },
  { id: 'weight', family: 'material-design-icons', name: 'weight' },
  { id: 'person-swimming', family: 'fontawesome6', name: 'person-swimming' },
  { id: 'boxing-glove', family: 'material-design-icons', name: 'boxing-glove' },
  { id: 'karate', family: 'material-design-icons', name: 'karate' },
  { id: 'sports-gymnastics', family: 'material-icons', name: 'sports-gymnastics' },
  { id: 'sports-handball', family: 'material-icons', name: 'sports-handball' },
  { id: 'sports-motorsports', family: 'material-icons', name: 'sports-motorsports' },
  { id: 'sports-soccer', family: 'material-icons', name: 'sports-soccer' },
  { id: 'parachute', family: 'material-design-icons', name: 'parachute' },
  // Requested as "activity (Lucide)" — MDI's pulse/activity-trace glyph.
  { id: 'pulse', family: 'material-design-icons', name: 'pulse' },
  { id: 'timer', family: 'material-design-icons', name: 'timer' },
  { id: 'rowing', family: 'material-design-icons', name: 'rowing' },
  { id: 'energy', family: 'simple-line-icons', name: 'energy' },
  // Requested as "moon (Lucide)" — MDI only has moon-phase variants, so
  // Ionicons' plain moon is the closer match.
  { id: 'moon', family: 'ionicons', name: 'moon' },
  // Requested as "heart (Lucide)".
  { id: 'heart', family: 'material-design-icons', name: 'heart' },
  { id: 'trophy', family: 'fontawesome6', name: 'trophy' },
  { id: 'rocket-launch', family: 'material-design-icons', name: 'rocket-launch' },
];

export function getIconOption(iconId: string | null | undefined): IconOption {
  return ICON_OPTIONS.find((option) => option.id === iconId) ?? getDefaultIconOption();
}

function getDefaultIconOption(): IconOption {
  const fallback = ICON_OPTIONS.find((option) => option.id === DEFAULT_ICON_ID);
  if (!fallback) {
    throw new Error(`Default icon "${DEFAULT_ICON_ID}" is missing from ICON_OPTIONS`);
  }
  return fallback;
}
