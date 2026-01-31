import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [count, setCount] = useState(3); // Default to 3 notifications

  const addNotification = () => {
    setCount((prev) => prev + 1);
  };

  const removeNotification = () => {
    setCount((prev) => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ count, addNotification, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

