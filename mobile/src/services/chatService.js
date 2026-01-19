import { api } from './api';

export const chatService = {
  // Get messages
  getMessages: async (params = {}) => {
    const response = await api.get('/chat/messages', { params });
    return response.data;
  },

  // Create message
  createMessage: async (data) => {
    const response = await api.post('/chat/messages', data);
    return response.data;
  },

  // Update message
  updateMessage: async (id, data) => {
    const response = await api.put(`/chat/messages/${id}`, data);
    return response.data;
  },

  // Delete message
  deleteMessage: async (id) => {
    const response = await api.delete(`/chat/messages/${id}`);
    return response.data;
  },

  // Mark conversation as read
  markConversationRead: async (data) => {
    const response = await api.post('/chat/read', data);
    return response.data;
  },
};
