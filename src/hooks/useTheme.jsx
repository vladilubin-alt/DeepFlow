import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ mode: 'dark' });

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ mode: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
