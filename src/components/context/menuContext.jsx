// src/context/MenuContext.jsx
import { createContext, useState } from 'react';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);

  // دالة لفتح/إغلاق قائمة الإشعارات
  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      if (!prev) {
        setIsSidebarMenuOpen(false); // إغلاق قائمة الـ User لو مفتوحة
      }
      return !prev;
    });
  };

  // دالة لفتح/إغلاق قائمة الـ User
  const toggleSidebarMenu = () => {
    setIsSidebarMenuOpen((prev) => {
      if (!prev) {
        setIsNotificationsOpen(false); // إغلاق قائمة الإشعارات لو مفتوحة
      }
      return !prev;
    });
  };

  return (
    <MenuContext.Provider
      value={{
        isNotificationsOpen,
        toggleNotifications,
        isSidebarMenuOpen,
        toggleSidebarMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};