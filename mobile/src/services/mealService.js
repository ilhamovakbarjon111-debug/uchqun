import { api } from './api';
import { extractResponseData, extractResponseDataWithFallback } from '../utils/responseHandler';

export const mealService = {
  // Get meals (for both parent and teacher)
  // Backend returns: Direct array [] (no wrapper)
  getMeals: async (params = {}) => {
    const response = await api.get('/meals', { params });
    // Direct array format, but handle wrapper if present
    const data = extractResponseDataWithFallback(response, []);
    return Array.isArray(data) ? data : [];
  },

  // Backend returns: Direct object (no wrapper)
  getMealById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    // Direct object format, but handle wrapper if present
    return extractResponseDataWithFallback(response);
  },

  // CRUD operations (teacher only)
  // Backend returns: Direct object
  createMeal: async (data) => {
    const response = await api.post('/meals', data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: Direct object
  updateMeal: async (id, data) => {
    const response = await api.put(`/meals/${id}`, data);
    // Direct object format
    return extractResponseDataWithFallback(response);
  },

  // Backend returns: { success: true, message: ... }
  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    // Handle both wrapper and direct formats
    return extractResponseDataWithFallback(response, { success: true });
  },
};
