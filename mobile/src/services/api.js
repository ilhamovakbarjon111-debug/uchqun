import axios from 'axios';
import { API_URL } from '../config';
import { getStoredAuth, clearAuth } from '../storage/authStorage';

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
  // Skip adding token for login endpoint
  const isAuthEndpoint = config.url?.includes('/auth/login');
  
  if (!isAuthEndpoint) {
    const { accessToken } = await getStoredAuth();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  
  // If the request data is FormData, remove Content-Type to let React Native set it with boundary
  // Use .set(undefined) for Axios 1.x AxiosHeaders compatibility (delete operator does not work)
  if (config.data instanceof FormData) {
    config.headers.set('Content-Type', undefined);
  }
  
  // For base64 photo uploads, ensure proper Content-Type and increase timeout
  if (config.data && typeof config.data === 'object' && config.data.photoBase64) {
    config.headers['Content-Type'] = 'application/json';
    config.timeout = 60000; // 60 seconds for large base64 uploads
  }
  
  if (__DEV__) {
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log('[API] Response:', res.config?.url, res.status);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login');

    if (__DEV__) {
      console.log('[API] Error:', originalRequest?.url, error.response?.status, error.message);
    }

    // On 401 for non-auth endpoints, clear auth so user is redirected to login
    if (error.response?.status === 401 && !isAuthEndpoint) {
      await clearAuth();
    }
    return Promise.reject(error);
  }
);

// Cache interceptor for GET responses + invalidation on mutations
api.interceptors.response.use(
  async (response) => {
    const method = response.config?.method;
    if (method === 'get' && response.status >= 200 && response.status < 300) {
      // Cache successful GET responses
      try {
        const { cacheService } = await import('./cacheService');
        cacheService.set(response.config.url, response.config.params, response.data);
      } catch {}
    } else if (['post', 'put', 'delete', 'patch'].includes(method) && response.status >= 200 && response.status < 300) {
      // Invalidate cache after successful mutations so fresh data is fetched next time
      try {
        const { cacheService } = await import('./cacheService');
        await cacheService.clear();
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
