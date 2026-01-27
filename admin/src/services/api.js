import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://uchqun-production.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies with every request
});

// Request interceptor — only handle FormData content-type
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Cookie-based refresh — server reads refreshToken from cookie
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
