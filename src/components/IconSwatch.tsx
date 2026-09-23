import { View } from 'react-native';

import { theme } from '@/lib/theme';

import { AppIcon } from './AppIcon';

export type IconSwatchVariant = 'workout' | 'program';

type Props = {
  iconId: string | null | undefined;
  variant: IconSwatchVariant;
  size?: number;
};

// The rounded-square icon badge used for both Workouts and Programs
// wherever their icon is shown (list rows, editor forms, Program day rows —
// see spec/features/workout.md and spec/features/program.md, "Icon
// selection"). Workout: primary/yellow square, black icon. Program: black
// square, primary/yellow border and icon — kept visually distinct so a
// Program day's Workout reference (always rendered with variant="workout")
// doesn't get confused with the Program's own icon.
export function IconSwatch({ iconId, variant, size = 40 }: Props) {
  const isProgram = variant === 'program';
  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        backgroundColor: isProgram ? theme.background : theme.primary,
        borderWidth: isProgram ? 2 : 0,
        borderColor: theme.primary,
      }}
    >
      <AppIcon iconId={iconId} size={Math.round(size * 0.55)} color={isProgram ? theme.primary : theme.background} />
    </View>
  );
}
