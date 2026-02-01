import { api } from './api';

export const mediaService = {
  // Get media (for both parent and teacher)
  getMedia: async (params = {}) => {
    const response = await api.get('/media', { params });
    return response.data;
  },

  getMediaById: async (id) => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  // CRUD operations (teacher only)
  createMedia: async (data) => {
    const response = await api.post('/media', data);
    return response.data;
  },

  uploadMedia: async (formData) => {
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMedia: async (id, data) => {
    const response = await api.put(`/media/${id}`, data);
    return response.data;
  },

  deleteMedia: async (id) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },
};
