import { api } from './api';

export const mealService = {
  // Get meals (for both parent and teacher)
  getMeals: async (params = {}) => {
    const response = await api.get('/meals', { params });
    return response.data;
  },

  getMealById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  // CRUD operations (teacher only)
  createMeal: async (data) => {
    const response = await api.post('/meals', data);
    return response.data;
  },

  updateMeal: async (id, data) => {
    const response = await api.put(`/meals/${id}`, data);
    return response.data;
  },

  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },
};
