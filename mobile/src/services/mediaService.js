import { api } from './api';
import { extractResponseData, extractResponseDataWithFallback } from '../utils/responseHandler';

export const mediaService = {
  // Get media (for both parent and teacher)
  // Backend returns: Direct array [] (no wrapper)
  getMedia: async (params = {}) => {
    const response = await api.get('/media', { params });
    // Direct array format, but handle wrapper if present
    const data = extractResponseDataWithFallback(response, []);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: Direct object (no wrapper)
  getMediaById: async (id) => {
    const response = await api.get(`/media/${id}`);
    // Direct object format, but handle wrapper if present
    return extractResponseDataWithFallback(response);
  },

  // CRUD operations (teacher only)
  // Backend returns: Direct object
  createMedia: async (data) => {
    const response = await api.post('/media', data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: Direct object
  uploadMedia: async (formData) => {
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Direct object format (upload response)
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: Direct object
  updateMedia: async (id, data) => {
    const response = await api.put(`/media/${id}`, data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: { success: true, message: ... }
  deleteMedia: async (id) => {
    const response = await api.delete(`/media/${id}`);
    // Handle both wrapper and direct formats
    return extractResponseDataWithFallback(response, { success: true });
  },
};
