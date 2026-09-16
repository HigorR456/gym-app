import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Tabs } from 'expo-router';

import { theme } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.surface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="list-check" iconStyle="solid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="layer-group" iconStyle="solid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="start"
        options={{
          title: 'Start',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="dumbbell" iconStyle="solid" color={color} size={size + 4} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calendar-days" iconStyle="solid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="gear" iconStyle="solid" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
