import { api } from './api';
import { extractResponseData } from '../utils/responseHandler';

export const notificationService = {
  // Get notifications
  // Backend returns: { success: true, data: [...], unreadCount: N, total: N }
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    const data = response.data;
    
    // Extract data array and metadata
    return {
      data: Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []),
      unreadCount: data?.unreadCount || 0,
      total: data?.total || 0,
    };
  },

  // Get unread count
  // Backend returns: { success: true, count: N }
  getUnreadCount: async () => {
    const response = await api.get('/notifications/count');
    const data = response.data;
    // Extract count from { success: true, count: N }
    return data?.count || 0;
  },

  // Mark as read
  // Backend returns: { success: true, message: ... }
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return extractResponseData(response);
  },

  // Mark all as read
  // Backend returns: { success: true, message: ... }
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return extractResponseData(response);
  },

  // Delete notification
  // Backend returns: { success: true, message: ... }
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return extractResponseData(response);
  },
};
