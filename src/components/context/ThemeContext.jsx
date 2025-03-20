// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react';


export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // الـ theme الافتراضي هو Light Mode

  // دالة لتغيير الـ theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';  
    setTheme(newTheme);
    document.body.className = newTheme; // غير class بتاعة الـ body عشان تطبق الـ theme
  };

  // تطبيق الـ theme عند التحميل الأولي
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};