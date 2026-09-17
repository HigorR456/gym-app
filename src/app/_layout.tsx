import '../../global.css';
import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/AppProviders';
import { useLanguagePreference } from '@/i18n/useLanguagePreference';

// Descendant of AppProviders (not RootLayout itself) so useLanguagePreference
// can reach the SQLite context set up inside AppProviders.
function AppContent() {
  useLanguagePreference();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
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
