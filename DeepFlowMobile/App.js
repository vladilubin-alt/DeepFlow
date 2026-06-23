import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import ActiveSessionScreen from './src/screens/ActiveSessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import VaultScreen from './src/screens/VaultScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const { colours } = useTheme();
  const icons = { Home: '⌂', History: '☰', Vault: '◆', Settings: '⚙' };
  return (
    <Text style={{ fontSize: 18, color: focused ? colours.accentAmberDark : colours.textMuted }}>
      {icons[label] || '?'}
    </Text>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { colours } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: colours.accentAmberDark,
        tabBarInactiveTintColor: colours.textMuted,
        tabBarStyle: {
          backgroundColor: colours.backgroundBase,
          borderTopWidth: 0.5,
          borderTopColor: colours.borderSubtle,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ tabBarButton: () => null, tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
