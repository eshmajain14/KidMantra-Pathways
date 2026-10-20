'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface DashboardThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mantra_theme');
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('mantra_theme', nextTheme);
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return nextTheme;
    });
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
  }
  return context;
}
