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

    // On 401, redirect to login (no refresh token endpoint)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect for auth endpoints
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                            originalRequest?.url?.includes('/auth/logout');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('superAdminUser');
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname.startsWith('/login');
        if (!isLoginPage) {
          window.location.href = '/login';
        }
      }
    }

    // On 403, log the error for debugging
    if (error.response?.status === 403) {
      console.error('403 Forbidden error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        error: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
