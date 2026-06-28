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
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user', email: 'test@example.com' } } } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

jest.mock('../../src/services/AnalyticsService', () => ({
  track: jest.fn(),
  identify: jest.fn(),
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
      stateSuccess: '#1D9E75',
      stateDanger: '#E24B4A',
    },
    mode: 'dark',
    toggle: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (c) => c },
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: () => ({}),
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return { __esModule: true, GestureHandlerRootView: View, TouchableOpacity: View };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  test('renders without crashing', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });

  test('displays haptic feedback toggle', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Haptic feedback')).toBeTruthy();
  });

  test('displays sound effects toggle', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Sound effects')).toBeTruthy();
  });

  test('displays theme toggle', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Appearance')).toBeTruthy();
  });

  test('toggles haptic feedback', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const { getByText } = render(<SettingsScreen />);
    const hapticRow = getByText('Haptic feedback');
    fireEvent.press(hapticRow);
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@deepflow/settings/haptic', 'false');
    });
  });

  test('toggles sound effects', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const { getByText } = render(<SettingsScreen />);
    const soundRow = getByText('Sound effects');
    fireEvent.press(soundRow);
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@deepflow/settings/sound', 'false');
    });
  });

  test('displays version info', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/version/i)).toBeTruthy();
  });

  test('does not display dead sensory audio row', () => {
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('Sensory audio')).toBeNull();
  });
});
