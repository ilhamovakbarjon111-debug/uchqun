import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('superAdminToken');
      const storedUser = localStorage.getItem('superAdminUser');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          const userData = response.data;
          
          // Only allow Admin role for Super Admin panel
          if (userData.role === 'admin') {
            setUser(userData);
            localStorage.setItem('superAdminUser', JSON.stringify(userData));
          } else {
            // Not an admin, clear auth
            localStorage.removeItem('superAdminToken');
            localStorage.removeItem('superAdminRefreshToken');
            localStorage.removeItem('superAdminUser');
          }
        } catch (error) {
          // Token invalid, clear auth
          localStorage.removeItem('superAdminToken');
          localStorage.removeItem('superAdminRefreshToken');
          localStorage.removeItem('superAdminUser');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      // Only allow Admin role
      if (userData.role !== 'admin') {
        return { success: false, error: 'Access denied. Admin role required.' };
      }

      // Store tokens and user data with super admin prefix
      localStorage.setItem('superAdminToken', accessToken);
      localStorage.setItem('superAdminRefreshToken', refreshToken);
      localStorage.setItem('superAdminUser', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminRefreshToken');
    localStorage.removeItem('superAdminUser');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


