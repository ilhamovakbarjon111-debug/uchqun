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
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData } = response.data;

      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    try {
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'logout' }));
    } catch {
      // ignore
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isParent: user?.role === 'parent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
