// SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [battleAnimations, setBattleAnimations] = useState(() => {
    const saved = localStorage.getItem('battleAnimations');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [weatherAnimations, setWeatherAnimations] = useState(() => {
    const saved = localStorage.getItem('weatherAnimations');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('battleAnimations', JSON.stringify(battleAnimations));
  }, [battleAnimations]);

  useEffect(() => {
    localStorage.setItem('weatherAnimations', JSON.stringify(weatherAnimations));
  }, [weatherAnimations]);

  return (
    <SettingsContext.Provider
      value={{ battleAnimations, setBattleAnimations, weatherAnimations, setWeatherAnimations }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}