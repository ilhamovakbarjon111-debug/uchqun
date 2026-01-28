import axios from 'axios';
import { API_URL } from '../config';
import { getStoredAuth, storeAuth, clearAuth } from '../storage/authStorage';

// Log API URL for debugging
if (__DEV__) {
  console.log('[API] Base URL:', API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token and handle FormData
api.interceptors.request.use(async (config) => {
  // Skip adding token for auth endpoints (login, refresh)
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');
  
  if (!isAuthEndpoint) {
    const { accessToken } = await getStoredAuth();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  
  // If the request data is FormData, remove Content-Type to let React Native set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  if (__DEV__) {
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log('[API] Response:', res.config?.url, res.status);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't try to refresh for auth endpoints - just reject
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');
    
    if (__DEV__) {
      console.log('[API] Error:', originalRequest?.url, error.response?.status, error.message);
    }
    
    // Only try refresh for 401 errors on non-auth endpoints
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = await getStoredAuth();
        if (!refreshToken) {
          // No refresh token - user needs to login again
          await clearAuth();
          return Promise.reject(error);
        }

        const resp = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        // Backend returns { success: true, accessToken }
        const { accessToken, success } = resp.data || {};
        if (!success || !accessToken) {
          await clearAuth();
          return Promise.reject(new Error('Session expired. Please login again.'));
        }

        const current = await getStoredAuth();
        await storeAuth({ ...current, accessToken });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (e) {
        await clearAuth();
        return Promise.reject(error); // Return original error, not refresh error
      }
    }
    return Promise.reject(error);
  }
);

// Cache interceptor for GET responses
api.interceptors.response.use(
  async (response) => {
    // Cache successful GET responses (guard: response.config may be missing on synthetic responses)
    if (response.config?.method === 'get' && response.status >= 200 && response.status < 300) {
      try {
        const { cacheService } = await import('./cacheService');
        const params = response.config.params;
        cacheService.set(response.config.url, params, response.data);
      } catch {}
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // On network error for GET requests, try cache
    if (!error.response && config?.method === 'get') {
      try {
        const { cacheService } = await import('./cacheService');
        const cached = await cacheService.get(config.url, config.params);
        if (cached) {
          const safeConfig = config || { method: 'get', url: '', params: undefined };
          return { data: cached.data, status: 200, config: safeConfig, _fromCache: true, _isStale: cached.isStale };
        }
      } catch {}
    }

    // On network error for mutation requests, queue for later
    if (!error.response && config && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
      try {
        const { offlineQueue } = await import('./offlineQueue');
        await offlineQueue.add({
          method: config.method,
          url: config.url,
          data: config.data,
          headers: { Authorization: config.headers?.Authorization },
        });
        console.log('[API] Request queued for offline replay:', config.method, config.url);
      } catch {}
    }

    return Promise.reject(error);
  }
);

// Clear cache on logout
api.clearCache = async () => {
  try {
    const { cacheService } = await import('./cacheService');
    await cacheService.clear();
  } catch {}
};

