import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trigger, HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { supabase } from './src/lib/supabase';
import { track, identify } from './src/services/AnalyticsService';
import { isOnboardingComplete, presentFlareQuiz } from './src/services/FlareQuizService';
import { processQueue } from './src/services/SyncQueue';
import { initSuperwall } from './src/services/SuperwallService';

import HomeScreen from './src/screens/HomeScreen';
import ActiveSessionScreen from './src/screens/ActiveSessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import VaultScreen from './src/screens/VaultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';

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
  const insets = useSafeAreaInsets();
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@deepflow/settings/haptic').then(v => {
      if (v !== null) setHapticEnabled(v === 'true');
    });
  }, []);

  const tabHaptic = useCallback(() => {
    if (hapticEnabled) {
      try { trigger(HapticFeedbackTypes.impactLight, { enableVibrateFallback: true, ignoreAndroidSystemSettings: false }); } catch (e) {}
    }
  }, [hapticEnabled]);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(s);
          setAuthReady(true);
        }
      } catch (e) {
        console.warn('[Auth] init error:', e.message);
      } finally {
        if (mounted) setAuthReady(true);
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    processQueue();
    initSuperwall();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        identify(user.id);
        track('App Opened', { userId: user.id });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription?.unsubscribe();
  }, [authReady]);

  useEffect(() => {
    isOnboardingComplete().then((done) => {
      if (!done) presentFlareQuiz();
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

  if (!authReady) {
    return (
      <>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, backgroundColor: colours.backgroundBase, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colours.textMuted, fontSize: 13 }}>Connecting...</Text>
        </View>
      </>
    );
  }

  if (!session) {
    return <AuthScreen colours={colours} />;
  }

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
              height: 60 + insets.bottom,
              paddingBottom: 8 + insets.bottom,
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
            listeners={{ tabPress: () => tabHaptic() }}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            listeners={{ tabPress: () => tabHaptic() }}
            options={{
              tabBarLabel: 'History',
              tabBarIcon: ({ color, size }) => (
                <Icon name="time-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Vault"
            component={VaultScreen}
            listeners={{ tabPress: () => tabHaptic() }}
            options={{
              tabBarLabel: 'Vault',
              tabBarIcon: ({ color, size }) => (
                <Icon name="lock-closed-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            listeners={{ tabPress: () => tabHaptic() }}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Icon name="settings-outline" size={size} color={color} />
              ),
            }}
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
