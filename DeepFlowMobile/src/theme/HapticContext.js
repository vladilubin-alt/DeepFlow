import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = '@deepflow/settings/haptic';

const HapticContext = createContext({ enabled: true, toggleHaptic: () => {} });

export function HapticProvider({ children }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.getItem(STORAGE_KEY).then((v) => {
        if (v !== null) setEnabled(v === 'true');
      }).catch(() => {});
    } catch {}
  }, []);

  const toggleHaptic = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
      } catch {}
      return next;
    });
  }, []);

  return (
    <HapticContext.Provider value={{ enabled, toggleHaptic }}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHaptic() {
  return useContext(HapticContext);
}
