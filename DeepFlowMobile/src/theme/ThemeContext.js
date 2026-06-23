import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { light, dark } from './colours';

const STORAGE_KEY = '@deepflow/theme';

const ThemeContext = createContext({ mode: 'light', colours: light, toggle: () => {} });

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
        if (saved === 'dark' || saved === 'light') {
          setMode(saved);
        } else {
          setMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
        setLoaded(true);
      }).catch(() => {
        setMode(systemScheme === 'dark' ? 'dark' : 'light');
        setLoaded(true);
      });
    } catch {
      setMode(systemScheme === 'dark' ? 'dark' : 'light');
      setLoaded(true);
    }
  }, [systemScheme]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      } catch {}
      return next;
    });
  }, []);

  const colours = mode === 'dark' ? dark : light;

  return (
    <ThemeContext.Provider value={{ mode, colours, toggle, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
