import { api } from './api';
import { extractResponseData } from '../utils/responseHandler';

export const teacherService = {
  // Dashboard
  // Backend returns: { success: true, data: {...} }
  getDashboard: async () => {
    const response = await api.get('/teacher/dashboard');
    return extractResponseData(response);
  },

  // Profile
  // Backend returns: { success: true, data: {...} }
  getProfile: async () => {
    const response = await api.get('/teacher/profile');
    return extractResponseData(response);
  },

  // Responsibilities
  // Backend returns: { success: true, data: [...] }
  getResponsibilities: async () => {
    const response = await api.get('/teacher/responsibilities');
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: { success: true, data: {...} }
  getResponsibilityById: async (id) => {
    const response = await api.get(`/teacher/responsibilities/${id}`);
    return extractResponseData(response);
  },

  // Tasks
  // Backend returns: { success: true, data: [...] }
  getTasks: async () => {
    const response = await api.get('/teacher/tasks');
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: { success: true, data: {...} }
  getTaskById: async (id) => {
    const response = await api.get(`/teacher/tasks/${id}`);
    return extractResponseData(response);
  },

  updateTaskStatus: async (id, status) => {
    const response = await api.put(`/teacher/tasks/${id}/status`, { status });
    return extractResponseData(response);
  },

  // Work History
  // Backend returns: { success: true, data: [...] }
  getWorkHistory: async () => {
    const response = await api.get('/teacher/work-history');
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: { success: true, data: {...} }
  getWorkHistoryById: async (id) => {
    const response = await api.get(`/teacher/work-history/${id}`);
    return extractResponseData(response);
  },

  updateWorkHistoryStatus: async (id, status) => {
    const response = await api.put(`/teacher/work-history/${id}/status`, { status });
    return extractResponseData(response);
  },

  // Parents (read-only)
  // Special case: Backend returns { parents: [...], total: N } NOT { success: true, data: ... }
  getParents: async () => {
    const response = await api.get('/teacher/parents');
    const data = response.data;
    // Handle special format: { parents: [...], total: N }
    if (data?.parents) {
      return data.parents;
    }
    // Fallback to standard extraction
    return extractResponseData(response) || [];
  },

  // Backend returns: { success: true, data: {...} }
  getParentById: async (id) => {
    const response = await api.get(`/teacher/parents/${id}`);
    return extractResponseData(response);
  },

  // Messages
  // Backend returns: { success: true, data: [...] }
  getMessages: async () => {
    const response = await api.get('/teacher/messages');
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  },

  sendMessage: async (data) => {
    const response = await api.post('/teacher/message-to-super-admin', data);
    return extractResponseData(response);
  },
};
