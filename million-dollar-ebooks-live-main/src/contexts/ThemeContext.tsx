
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  forceTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to dark mode
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    
    // Default to dark mode instead of system preference
    return 'dark';
  });
  
  const [forcedTheme, setForcedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Only save to localStorage if theme is not forced
    if (forcedTheme === null) {
      localStorage.setItem('theme', theme);
    }
    
    // Apply theme to document - use forced theme if available, otherwise use regular theme
    const activeTheme = forcedTheme || theme;
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, forcedTheme]);

  const toggleTheme = () => {
    if (forcedTheme === null) {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }
  };

  const forceTheme = (newForcedTheme: Theme | null) => {
    setForcedTheme(newForcedTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: forcedTheme || theme, 
      toggleTheme, 
      forceTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
