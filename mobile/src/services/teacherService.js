import { api } from './api';

export const teacherService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/teacher/dashboard');
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await api.get('/teacher/profile');
    return response.data;
  },

  // Responsibilities
  getResponsibilities: async () => {
    const response = await api.get('/teacher/responsibilities');
    return response.data;
  },

  getResponsibilityById: async (id) => {
    const response = await api.get(`/teacher/responsibilities/${id}`);
    return response.data;
  },

  // Tasks
  getTasks: async () => {
    const response = await api.get('/teacher/tasks');
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/teacher/tasks/${id}`);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await api.put(`/teacher/tasks/${id}/status`, { status });
    return response.data;
  },

  // Work History
  getWorkHistory: async () => {
    const response = await api.get('/teacher/work-history');
    return response.data;
  },

  getWorkHistoryById: async (id) => {
    const response = await api.get(`/teacher/work-history/${id}`);
    return response.data;
  },

  updateWorkHistoryStatus: async (id, status) => {
    const response = await api.put(`/teacher/work-history/${id}/status`, { status });
    return response.data;
  },

  // Parents (read-only)
  getParents: async () => {
    const response = await api.get('/teacher/parents');
    return response.data;
  },

  getParentById: async (id) => {
    const response = await api.get(`/teacher/parents/${id}`);
    return response.data;
  },

  // Messages
  getMessages: async () => {
    const response = await api.get('/teacher/messages');
    return response.data;
  },

  sendMessage: async (data) => {
    const response = await api.post('/teacher/message-to-super-admin', data);
    return response.data;
  },
};
