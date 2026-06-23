import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { supabase } from './src/lib/supabase';
import { track, identify } from './src/services/AnalyticsService';

import HomeScreen from './src/screens/HomeScreen';
import ActiveSessionScreen from './src/screens/ActiveSessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import VaultScreen from './src/screens/VaultScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ActiveSession" component={ActiveSessionScreen} />
    </HomeStack.Navigator>
  );
}

function AppContent() {
  const { colours, mode } = useTheme();
  const isDark = mode === 'dark';

  useEffect(() => {
    supabase.auth.signInAnonymously().then(({ data, error }) => {
      if (error) {
        console.warn('[Auth] signInAnonymously failed:', error.message);
        return;
      }
      const user = data?.user;
      if (user) {
        identify(user.id);
        track('App Opened', { userId: user.id });
      }
    });
  }, []);

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colours.accentGold,
          background: colours.backgroundBase,
          card: colours.backgroundSurface,
          text: colours.textPrimary,
          border: colours.borderSubtle,
          notification: colours.stateDanger,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colours.accentGold,
          background: colours.backgroundBase,
          card: colours.backgroundSurface,
          text: colours.textPrimary,
          border: colours.borderSubtle,
          notification: colours.stateDanger,
        },
      };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colours.backgroundSurface,
              borderTopColor: colours.borderSubtle,
              borderTopWidth: 0.5,
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarActiveTintColor: colours.accentGold,
            tabBarInactiveTintColor: colours.textMuted,
            tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStackScreen}
            options={{ tabBarLabel: 'Home' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ tabBarLabel: 'History' }}
          />
          <Tab.Screen
            name="Vault"
            component={VaultScreen}
            options={{ tabBarLabel: 'Vault' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarLabel: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
