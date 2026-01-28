import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return safe defaults instead of throwing
    console.warn('[useNotification] Used outside NotificationProvider, returning safe defaults');
    return {
      count: 0,
      notifications: [],
      loading: false,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      refreshNotifications: () => {},
      loadAllNotifications: async () => {},
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications/count');
      setCount(response.data?.count || response.data?.data?.count || 0);
    } catch (error) {
      console.error('Error loading notification count:', error);
      setCount(0);
    }
  };

  const loadAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      setCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await loadNotifications();
      await loadAllNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      await loadNotifications();
      await loadAllNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      await loadNotifications();
      await loadAllNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
    loadAllNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{ 
        count, 
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        loadAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
