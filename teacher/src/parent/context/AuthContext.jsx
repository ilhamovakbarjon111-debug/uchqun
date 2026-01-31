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
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      if (user && accessToken) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // If running inside React Native WebView, notify the native shell
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
