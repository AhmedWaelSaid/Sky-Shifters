// src/context/ThemeContext.jsx
import { createContext } from 'react';
import { useLocalStorageState } from '../../services/useLocalStorageState';
import React, { useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // استخدم هوك التخزين المحلي
  const [theme, setTheme] = useLocalStorageState('light', 'theme');

  // دالة لتغيير الـ theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';  
    setTheme(newTheme);
    document.body.className = newTheme; // غير class بتاعة الـ body عشان تطبق الـ theme
  };

  // تطبيق الـ theme عند التحميل الأولي
  // لو theme اتغير في localStorage أو أول تحميل
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};