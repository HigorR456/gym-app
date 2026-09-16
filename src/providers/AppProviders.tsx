import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Single composition point for app-wide providers (more will be added here
// as they're needed, e.g. i18n — see spec/technical/i18n.md — rather than
// stacking providers directly in the root layout).
export function AppProviders({ children }: PropsWithChildren) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
