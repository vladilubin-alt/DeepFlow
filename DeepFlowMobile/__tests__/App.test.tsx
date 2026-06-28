jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: { impactLight: 'impactLight', impactMedium: 'impactMedium', impactHeavy: 'impactHeavy' },
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: { configure: jest.fn() },
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key',
    MIXPANEL_TOKEN: 'test-token',
    REVENUECAT_API_KEY: 'test-rc-key',
  },
}));

jest.mock('@react-native-community/netinfo', () => {
  const addEventListener = jest.fn(() => ({ remove: jest.fn() }));
  return {
    __esModule: true,
    default: { addEventListener, fetch: jest.fn().mockResolvedValue({ isConnected: true }) },
  };
});

jest.mock('react-native-audio-api', () => ({
  AudioContext: jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 0 },
      type: 'sine',
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: { value: 0, linearRampToValueAtTime: jest.fn() },
    }),
    createChannelMerger: jest.fn().mockReturnValue({ connect: jest.fn() }),
    destination: {},
    close: jest.fn(),
    currentTime: 0,
    state: 'running',
  })),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
      signInAnonymously: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

jest.mock('../src/services/AnalyticsService', () => ({
  track: jest.fn(),
  identify: jest.fn(),
}));

jest.mock('../src/services/FlareQuizService', () => ({
  isOnboardingComplete: jest.fn().mockResolvedValue(true),
  presentFlareQuiz: jest.fn(),
}));

jest.mock('../src/services/SuperwallService', () => ({
  initSuperwall: jest.fn(),
}));

jest.mock('@superwall/react-native-superwall', () => ({
  __esModule: true,
  default: { register: jest.fn(), identify: jest.fn() },
}));

jest.mock('../src/theme/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    colours: {
      backgroundBase: '#0a0a0a',
      backgroundSurface: '#1a1a1a',
      textPrimary: '#ffffff',
      textMuted: '#888888',
      accentGold: '#EF9F27',
      borderSubtle: '#333333',
      stateDanger: '#E24B4A',
    },
    mode: 'dark',
    toggle: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (c) => c },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: () => ({}),
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    GestureHandlerRootView: View,
    TouchableOpacity: View,
    PanGestureHandler: View,
    State: {},
  };
});

jest.mock('react-native-screens', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    Screen: View,
    ScreenContainer: View,
    NativeScreenNavigationContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    enableFreeze: jest.fn(),
  };
});

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  test('renders without crashing', () => {
    const { getByText } = render(<App />);
    expect(getByText('Connecting...')).toBeTruthy();
  });

  test('shows connecting state initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Connecting...')).toBeTruthy();
  });
});
