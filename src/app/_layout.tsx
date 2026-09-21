import '../../global.css';
import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useLanguagePreference } from '@/i18n/useLanguagePreference';
import { theme } from '@/lib/theme';
import { AppProviders } from '@/providers/AppProviders';

// Descendant of AppProviders (not RootLayout itself) so useLanguagePreference
// can reach the SQLite context set up inside AppProviders.
function AppContent() {
  useLanguagePreference();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerTitle: '',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
