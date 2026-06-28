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
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    single: jest.fn().mockResolvedValue({ data: { grace_tokens: 3 }, error: null }),
    update: jest.fn().mockReturnThis(),
  },
}));

jest.mock('../../src/services/AnalyticsService', () => ({
  track: jest.fn(),
  identify: jest.fn(),
}));

jest.mock('../../src/services/SuperwallService', () => ({
  triggerGraceTokenPaywall: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
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
      stateDangerMuted: '#884444',
    },
    mode: 'dark',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (c) => c },
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return { __esModule: true, GestureHandlerRootView: View, TouchableOpacity: View };
});

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import VaultScreen from '../../src/screens/VaultScreen';

describe('VaultScreen', () => {
  test('renders without crashing', async () => {
    const { getByText } = render(<VaultScreen />);
    expect(getByText('Vault')).toBeTruthy();
  });

  test('shows loading state initially', () => {
    const { getByText } = render(<VaultScreen />);
    expect(getByText('Loading vault...')).toBeTruthy();
  });

  test('shows empty state when no entries', async () => {
    const { getByText } = render(<VaultScreen />);
    await waitFor(() => {
      expect(getByText('No drafts in the vault yet.')).toBeTruthy();
    });
  });

  test('displays grace tokens count', async () => {
    const { getByText } = render(<VaultScreen />);
    await waitFor(() => {
      expect(getByText(/grace tokens remaining/)).toBeTruthy();
    });
  });
});
