import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://uchqun-production.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Request interceptor — CSRF token + FormData content-type
api.interceptors.request.use(
  (config) => {
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      const csrfToken = getCookie('csrfToken');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
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
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        localStorage.removeItem('user');
        try {
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'sessionExpired' }));
        } catch {
          // ignore
        }
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
