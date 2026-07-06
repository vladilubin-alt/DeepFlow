import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, Text, Linking } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HapticProvider, useHaptic } from './src/theme/HapticContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trigger, HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { supabase } from './src/lib/supabase';
import { track, identify } from './src/services/AnalyticsService';
import { isOnboardingComplete } from './src/services/FlareQuizService';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { processQueue } from './src/services/SyncQueue';
import { initSuperwall, setOnFirstPurchase } from './src/services/SuperwallService';

import FirstPurchaseReviewModal from './src/components/FirstPurchaseReviewModal';
import CookieConsent from './src/components/CookieConsent';
import { enableAnalytics } from './src/services/AnalyticsService';

import HomeScreen from './src/screens/HomeScreen';
import ActiveSessionScreen from './src/screens/ActiveSessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import VaultScreen from './src/screens/VaultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import Splash from './src/components/Splash';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function AppContent() {
  const { colours, mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();

  function HomeStackScreen() {
    return (
      <HomeStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 320,
          contentStyle: { backgroundColor: colours.backgroundBase },
        }}
      >
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="ActiveSession" component={ActiveSessionScreen} />
      </HomeStack.Navigator>
    );
  }

  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [splashFinished, setSplashFinished] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { enabled: hapticEnabled } = useHaptic();

  const tabHaptic = useCallback(() => {
    if (hapticEnabled) {
      try { trigger(HapticFeedbackTypes.impactMedium, { enableVibrateFallback: true, ignoreAndroidSystemSettings: true }); } catch (e) {}
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
    const handleDeepLink = async ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'deepflow:') return;
        if (parsed.host !== 'auth' || parsed.pathname !== '/callback') return;
        const { data } = await supabase.auth.getSession();
        if (data?.session) setSession(data.session);
      } catch {}
    };
    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    return () => sub?.remove();
  }, []);

  function hashUserId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'u_' + Math.abs(hash).toString(36);
  }

  useEffect(() => {
    if (!authReady) return;
    processQueue();
    initSuperwall();
    setOnFirstPurchase(() => setShowReviewModal(true));
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        identify(hashUserId(user.id));
        track('App Opened');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription?.unsubscribe();
  }, [authReady]);

  useEffect(() => {
    isOnboardingComplete().then((done) => {
      if (!done) setShowOnboarding(true);
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

  const handleOnboardingComplete = useCallback((flare) => {
    setShowOnboarding(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {showOnboarding ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : authReady ? (
        !session ? (
          <AuthScreen colours={colours} />
        ) : (
          <NavigationContainer theme={navTheme}>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                tabBarHideOnKeyboard: true,
                lazy: true,
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
                  unmountOnBlur: false,
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
                  unmountOnBlur: false,
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
                  unmountOnBlur: false,
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
                  unmountOnBlur: false,
                  tabBarLabel: 'Settings',
                  tabBarIcon: ({ color, size }) => (
                    <Icon name="settings-outline" size={size} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        )
      ) : null}

      {!splashFinished && (
        <Splash
          colours={colours}
          ready={authReady}
          onFinish={() => setSplashFinished(true)}
        />
      )}

      <FirstPurchaseReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />

      <CookieConsent onConsent={(c) => {
        if (c === 'accepted') {
          enableAnalytics();
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              identify(hashUserId(user.id));
              track('App Opened');
            }
          });
        }
      }} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HapticProvider>
          <AppContent />
        </HapticProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
