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
    // Add Bearer token from localStorage to all requests
    // This automatically bypasses CSRF protection on the backend
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Also add CSRF token from cookie as fallback (for cookie-based auth)
    // Helper function to get cookie value
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };
    
    // Add CSRF token for POST/PUT/DELETE requests if available
    // Bearer token takes priority, but CSRF token is added as fallback
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCookie('csrfToken') || localStorage.getItem('csrfToken');
      if (csrfToken && !config.headers['X-CSRF-Token']) {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - redirect to login (no refresh token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect for auth endpoints
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                            originalRequest?.url?.includes('/auth/logout');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        try {
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'sessionExpired' }));
        } catch {
          // ignore
        }
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname.startsWith('/login');
        if (!isLoginPage) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
