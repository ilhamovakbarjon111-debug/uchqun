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

api.interceptors.request.use(
  (config) => {
    // For JSON requests (like base64 photo upload), check if we have Bearer token
    // If Bearer token is present, CSRF is not required
    const hasBearerToken = config.headers?.Authorization?.startsWith('Bearer ') || 
                          config.headers?.authorization?.startsWith('Bearer ');
    
    // Only add CSRF token for cookie-based auth (not Bearer token)
    if (['post', 'put', 'delete', 'patch'].includes(config.method) && !hasBearerToken) {
      const csrfToken = getCookie('csrfToken');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      } else {
        console.warn('CSRF token not found in cookies for', config.method, config.url);
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

    // Handle 403 Forbidden (CSRF or permission error)
    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.error || '';
      
      // If CSRF error, try to get new CSRF token and retry
      if (errorMessage.includes('CSRF') || errorMessage.includes('csrf')) {
        originalRequest._retry = true;
        console.warn('CSRF token error, retrying request');
        
        // Try to get CSRF token from a GET request first
        try {
          await axios.get(`${BASE_URL}/auth/me`, { withCredentials: true });
          // Retry original request
          return api(originalRequest);
        } catch {
          // If that fails, redirect to login
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
    }

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
