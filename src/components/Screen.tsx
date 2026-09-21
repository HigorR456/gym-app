import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ViewProps & PropsWithChildren<{ className?: string }>;

// Reuses the same useSafeAreaInsets() approach ExerciseDetail's modal header
// already used, instead of introducing a second safe-area pattern (e.g.
// SafeAreaView) alongside it. Only pads the top: screens live either inside
// a tab (bottom already reserved by the tab bar) or a Stack screen with a
// native header (top already handled there), so this only needs to cover
// screens/modals with no header of their own.
export function Screen({ children, style, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ paddingTop: insets.top }, style]} {...rest}>
      {children}
    </View>
  );
}
