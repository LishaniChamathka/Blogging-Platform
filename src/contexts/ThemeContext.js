import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Custom hook to use theme functions anywhere in the app
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Initialize theme on first load
  useEffect(() => {
    console.log('Initializing theme...');
    
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    const savedIsSystemTheme = localStorage.getItem('isSystemTheme') === 'true';
    
    if (savedTheme && !savedIsSystemTheme) {
      // User has a manual preference
      const prefersDark = savedTheme === 'dark';
      setIsDark(prefersDark);
      setIsSystemTheme(false);
      console.log(`Applied saved theme: ${savedTheme}`);
    } else {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
      setIsSystemTheme(true);
      console.log(`Applied system theme: ${systemPrefersDark ? 'dark' : 'light'}`);
    }
  }, []);

  // Listen for system theme changes when using system preference
  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      console.log(`System theme changed to: ${e.matches ? 'dark' : 'light'}`);
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Cleanup listener when component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isSystemTheme]);

  // Apply theme to the document whenever it changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Save to localStorage if it's a manual preference
    if (!isSystemTheme) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      localStorage.setItem('isSystemTheme', 'false');
    } else {
      localStorage.setItem('isSystemTheme', 'true');
    }
  }, [isDark, isSystemTheme]);

  // Toggle between dark and light themes (switches to manual mode)
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setIsSystemTheme(false); // Switch to manual mode when user toggles
    
    console.log(`Theme manually switched to: ${newIsDark ? 'dark' : 'light'}`);
  };

  // Reset to system preference
  const useSystemTheme = () => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPrefersDark);
    setIsSystemTheme(true);
    
    // Clear manual preference
    localStorage.removeItem('theme');
    localStorage.setItem('isSystemTheme', 'true');
    
    console.log(`Switched to system theme: ${systemPrefersDark ? 'dark' : 'light'}`);
  };

  // Get current theme name for display
  const getThemeName = () => {
    if (isSystemTheme) {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return isDark ? 'Dark' : 'Light';
  };

  const themeValues = {
    isDark,
    isSystemTheme,
    toggleTheme,
    useSystemTheme,
    getThemeName,
    // Legacy support for components that expect these property names
    darkMode: isDark,
    toggleDarkMode: toggleTheme,
    theme: isDark ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};
