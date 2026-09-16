import { SQLiteProvider } from 'expo-sqlite';
import type { PropsWithChildren, ReactNode } from 'react';
import { Component, Suspense } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapDatabase } from '@/data/sqlite/bootstrapDatabase';
import { DATABASE_NAME } from '@/data/sqlite/database';

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text">Loading…</Text>
    </View>
  );
}

function DatabaseErrorFallback() {
  // Satisfies spec/technical/database-schema.md's "Critical failure
  // handling": a failed migration must not leave the app permanently
  // inaccessible with no explanation. A "reset local data" action can be
  // added here later if this proves insufficient in practice.
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-text text-center">
        Something went wrong setting up the local database. Please restart the app.
      </Text>
    </View>
  );
}

// SQLiteProvider's `useSuspense` mode throws init/migration errors during
// render instead of calling `onError` (the two are mutually exclusive) — a
// plain error boundary is the only way to catch that. React has no built-in
// one, hence the class component.
class DatabaseErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <DatabaseErrorFallback />;
    }
    return this.props.children;
  }
}

// Single composition point for app-wide providers (more will be added here
// as they're needed, e.g. i18n — see spec/technical/i18n.md — rather than
// stacking providers directly in the root layout).
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DatabaseErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <SQLiteProvider databaseName={DATABASE_NAME} onInit={bootstrapDatabase} useSuspense>
            {children}
          </SQLiteProvider>
        </Suspense>
      </DatabaseErrorBoundary>
    </SafeAreaProvider>
  );
}
