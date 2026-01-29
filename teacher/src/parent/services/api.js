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

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data || {};
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
        throw new Error('No access token in refresh response');
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
