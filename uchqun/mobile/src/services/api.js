import axios from 'axios';
import { API_URL } from '../config';
import { getStoredAuth, storeAuth, clearAuth } from '../storage/authStorage';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add token and handle FormData
api.interceptors.request.use(async (config) => {
  const { accessToken } = await getStoredAuth();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // If the request data is FormData, remove Content-Type to let React Native set it with boundary
  if (config.data instanceof FormData) {
    console.log('[API] FormData detected! Removing Content-Type header');
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = await getStoredAuth();
        if (!refreshToken) throw new Error('No refresh token');

        const resp = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = resp.data || {};
        if (!accessToken) throw new Error('Refresh did not return accessToken');

        const current = await getStoredAuth();
        await storeAuth({ ...current, accessToken });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (e) {
        await clearAuth();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

