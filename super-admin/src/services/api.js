import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://uchqun-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and Super Admin secret key
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (for authenticated requests)
    const token = localStorage.getItem('superAdminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Super Admin secret key if configured (for creating admins)
    const superAdminKey = import.meta.env.VITE_SUPER_ADMIN_SECRET_KEY;
    if (superAdminKey) {
      config.headers['x-super-admin-key'] = superAdminKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

export default api;

