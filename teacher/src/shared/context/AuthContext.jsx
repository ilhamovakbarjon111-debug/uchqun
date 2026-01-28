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
    // First check localStorage synchronously to avoid unnecessary API calls
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id && userData.role) {
          setUser(userData);
          setLoading(false);
          // Verify token in background (non-blocking)
          api.get('/auth/me')
            .then((response) => {
              const verifiedUser = response.data;
              if (verifiedUser) {
                setUser(verifiedUser);
                localStorage.setItem('user', JSON.stringify(verifiedUser));
              }
            })
            .catch(() => {
              // Token invalid - clear storage but don't redirect (let ProtectedRoute handle it)
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
            });
          return;
        }
      } catch (parseError) {
        // Invalid stored user data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    
    // No valid stored user - check API only if we have a token
    if (accessToken) {
      api.get('/auth/me')
        .then((response) => {
          const userData = response.data;
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token at all - just clear and set loading to false
      localStorage.removeItem('user');
      setLoading(false);
    }
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

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
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
