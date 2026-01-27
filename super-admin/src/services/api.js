import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://uchqun-production.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Add Super Admin secret key if configured (for creating admins)
    const superAdminKey = import.meta.env.VITE_SUPER_ADMIN_SECRET_KEY;
    if (superAdminKey) {
      config.headers['x-super-admin-key'] = superAdminKey;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        localStorage.removeItem('superAdminUser');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
