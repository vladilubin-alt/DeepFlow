jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: { configure: jest.fn() },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: jest.fn(() => ({ remove: jest.fn() })), fetch: jest.fn().mockResolvedValue({ isConnected: true }) },
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key',
    MIXPANEL_TOKEN: 'test-token',
  },
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

jest.mock('../../src/services/AnalyticsService', () => ({
  track: jest.fn(),
  identify: jest.fn(),
}));

jest.mock('../../src/services/FlareQuizService', () => ({
  isOnboardingComplete: jest.fn().mockResolvedValue(true),
  presentFlareQuiz: jest.fn(),
  getStoredFlare: jest.fn().mockResolvedValue('time_warp'),
}));

jest.mock('../../src/services/FlareConfig', () => ({
  getFlareDefaults: jest.fn().mockReturnValue({ duration: '25m', wordTarget: '300', sensory: 'off', aiMode: 'silent' }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/theme/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    colours: {
      backgroundBase: '#0a0a0a',
      backgroundSurface: '#1a1a1a',
      textPrimary: '#ffffff',
      textMuted: '#888888',
      accentGold: '#EF9F27',
      borderSubtle: '#333333',
    },
    mode: 'dark',
    toggle: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (c) => c,
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => ({}),
    withTiming: (v) => v,
    withSpring: (v) => v,
    Easing: { linear: (v) => v },
  };
});

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

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders without crashing', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('ADHD WRITING INSTRUMENT')).toBeTruthy();
  });

  test('displays duration options', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('3m')).toBeTruthy();
    expect(getByText('25m')).toBeTruthy();
    expect(getByText('60m')).toBeTruthy();
  });

  test('displays word target options', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('25')).toBeTruthy();
    expect(getByText('300')).toBeTruthy();
    expect(getByText('750')).toBeTruthy();
  });

  test('displays AI mode options', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('silent')).toBeTruthy();
    expect(getByText('coach')).toBeTruthy();
    expect(getByText('demon')).toBeTruthy();
  });

  test('displays sensory mode options', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('off')).toBeTruthy();
    expect(getByText('alpha')).toBeTruthy();
    expect(getByText('beta')).toBeTruthy();
  });

  test('navigates to ActiveSession on start', async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    const startBtn = getByText('Start Session');
    fireEvent.press(startBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ActiveSession', expect.objectContaining({
        durationMinutes: expect.any(Number),
        targetWords: expect.any(Number),
        sensoryMode: expect.any(String),
        aiMode: expect.any(String),
      }));
    });
  });
});
