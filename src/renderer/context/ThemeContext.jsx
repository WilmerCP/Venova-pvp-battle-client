// ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import THEMES from '../lib/temas.js'

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('activeThemeId') || 0;
  });

  useEffect(() => {
    localStorage.setItem('activeThemeId', activeThemeId);
  }, [activeThemeId]);

  const theme = THEMES[activeThemeId] || THEMES[0];

  return (
    <ThemeContext.Provider value={{ activeThemeId, setActiveThemeId, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}