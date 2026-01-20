import { api } from './api';
import { extractResponseData, extractResponseDataWithFallback } from '../utils/responseHandler';

export const activityService = {
  // Get activities (for both parent and teacher)
  // Backend returns: Direct array [] (no wrapper)
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params });
    // Direct array format, but handle wrapper if present
    const data = extractResponseDataWithFallback(response, []);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: Direct object (no wrapper)
  getActivityById: async (id) => {
    const response = await api.get(`/activities/${id}`);
    // Direct object format, but handle wrapper if present
    return extractResponseDataWithFallback(response);
  },

  // CRUD operations (teacher only)
  // Backend returns: Direct object (201 status)
  createActivity: async (data) => {
    const response = await api.post('/activities', data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: Direct object
  updateActivity: async (id, data) => {
    const response = await api.put(`/activities/${id}`, data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: { success: true, message: ... }
  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    // Handle both wrapper and direct formats
    return extractResponseDataWithFallback(response, { success: true });
  },
};
