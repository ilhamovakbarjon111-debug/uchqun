import { api } from './api';

export const activityService = {
  // Get activities (for both parent and teacher)
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  getActivityById: async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  // CRUD operations (teacher only)
  createActivity: async (data) => {
    const response = await api.post('/activities', data);
    return response.data;
  },

  updateActivity: async (id, data) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
};
