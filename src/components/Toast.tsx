import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

export type ToastData = {
  // Bumped on every trigger (even for the same message twice in a row) so
  // the animation always restarts for a new toast instead of silently
  // keeping the one already in flight — see Toast's effect below.
  id: number;
  message: string;
};

type Props = {
  toast: ToastData | null;
  onHide: () => void;
};

// Slides up + fades in/out, driven by one Animated.Value so both stay in
// sync. Keyed on `toast.id` (not a plain `visible` boolean) so triggering a
// second toast while one is still showing replaces it and restarts the
// animation immediately — the latest action always wins instead of queueing
// behind whatever was already on screen.
export function Toast({ toast, onHide }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  // Callers typically pass an inline `onHide`, a new function every render —
  // kept in a ref so it's never a dependency that could restart the effect.
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!toast) {
      return;
    }
    progress.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        onHideRef.current();
      }
    });
    return () => animation.stop();
  }, [toast?.id, progress]);

  if (!toast) {
    return null;
  }

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ opacity: progress, transform: [{ translateY }] }}
      className="absolute top-2 self-center rounded-full bg-primary px-4 py-2"
    >
      <Text className="text-background text-sm font-medium">{toast.message}</Text>
    </Animated.View>
  );
}
