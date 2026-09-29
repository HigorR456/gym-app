import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ViewProps & PropsWithChildren<{ className?: string }>;

// Reuses the same useSafeAreaInsets() approach ExerciseDetail's modal header
// already used, instead of introducing a second safe-area pattern (e.g.
// SafeAreaView) alongside it.
//
// Pads both top and bottom. Originally top-only (reasoning: a tab screen's
// bottom is already reserved by the tab bar, and a Stack screen's native
// header already handles the top) — but that left `insets.bottom` unhandled
// for Stack screens with no native header (e.g. SessionScreen, and any
// Modal like ExerciseCatalog's picker mode), where interactive elements
// near the bottom edge (RestTimer's Skip/+10s/-10s, the Previous/Next nav,
// a modal's Done button) rendered fine but silently ate zero taps: on a
// gesture-navigation device the system nav's touch-priority zone overlaps
// unpadded content there, and Android hands it those touches instead of the
// app. Found the hard way (step 16) chasing what looked like a RestTimer
// bug. Padding bottom on every screen is harmless for tab screens too — the
// tab bar positions itself independently of this padding.
export function Screen({ children, style, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, style]} {...rest}>
      {children}
    </View>
  );
}
