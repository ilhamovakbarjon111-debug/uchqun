import { api } from './api';

export const parentService = {
  // Get children
  getChildren: async () => {
    const response = await api.get('/parent/children');
    return response.data;
  },

  // Get activities
  getActivities: async (params = {}) => {
    const response = await api.get('/parent/activities', { params });
    return response.data;
  },

  getActivityById: async (id) => {
    const response = await api.get(`/parent/activities/${id}`);
    return response.data;
  },

  // Get meals
  getMeals: async (params = {}) => {
    const response = await api.get('/parent/meals', { params });
    return response.data;
  },

  getMealById: async (id) => {
    const response = await api.get(`/parent/meals/${id}`);
    return response.data;
  },

  // Get media
  getMedia: async (params = {}) => {
    const response = await api.get('/parent/media', { params });
    return response.data;
  },

  getMediaById: async (id) => {
    const response = await api.get(`/parent/media/${id}`);
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/parent/profile');
    return response.data;
  },

  // Ratings
  getRating: async () => {
    const response = await api.get('/parent/ratings');
    return response.data;
  },

  rateTeacher: async (data) => {
    const response = await api.post('/parent/ratings', data);
    return response.data;
  },

  getSchoolRating: async () => {
    const response = await api.get('/parent/school-rating');
    return response.data;
  },

  rateSchool: async (data) => {
    const response = await api.post('/parent/school-rating', data);
    return response.data;
  },

  getSchools: async () => {
    const response = await api.get('/parent/schools');
    return response.data;
  },

  // AI Chat
  aiChat: async (message) => {
    const response = await api.post('/parent/ai/chat', { message });
    return response.data;
  },

  // Messages
  getMessages: async () => {
    const response = await api.get('/parent/messages');
    return response.data;
  },

  sendMessage: async (data) => {
    const response = await api.post('/parent/message-to-super-admin', data);
    return response.data;
  },
};
