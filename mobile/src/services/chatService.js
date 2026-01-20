import { api } from './api';
import { extractResponseData, extractResponseDataWithFallback } from '../utils/responseHandler';

export const chatService = {
  // Get messages
  // Backend returns: Direct array [] (no wrapper)
  getMessages: async (params = {}) => {
    const response = await api.get('/chat/messages', { params });
    // Direct array format, but handle wrapper if present
    const data = extractResponseDataWithFallback(response, []);
    return Array.isArray(data) ? data : [];
  },

  // Create message
  // Backend returns: Direct object (201 status)
  createMessage: async (data) => {
    const response = await api.post('/chat/messages', data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Update message
  // Backend returns: Direct object
  updateMessage: async (id, data) => {
    const response = await api.put(`/chat/messages/${id}`, data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Delete message
  // Backend returns: { success: true }
  deleteMessage: async (id) => {
    const response = await api.delete(`/chat/messages/${id}`);
    // Handle both wrapper and direct formats
    return extractResponseDataWithFallback(response, { success: true });
  },

  // Mark conversation as read
  // Backend returns: { success: true }
  markConversationRead: async (data) => {
    const response = await api.post('/chat/read', data);
    // Handle both wrapper and direct formats
    return extractResponseDataWithFallback(response, { success: true });
  },
};
