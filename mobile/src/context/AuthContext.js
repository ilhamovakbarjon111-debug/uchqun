import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { clearAuth, getStoredAuth, storeAuth } from '../storage/authStorage';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = await getStoredAuth();
        if (!alive) return;
        setUser(stored.user);
        setAccessToken(stored.accessToken || null);
        setRefreshToken(stored.refreshToken || null);
      } catch (error) {
        console.error('[AuthContext] Bootstrap error:', error);
      } finally {
        setBootstrapping(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = async (email, password) => {
    const resp = await api.post('/auth/login', { email, password });
    // Backend returns { success: true, accessToken, refreshToken, user }
    const { accessToken, refreshToken, user, success } = resp.data || {};
    if (!success || !accessToken || !user) {
      throw new Error(resp.data?.error || 'Invalid login response');
    }
    await storeAuth({ accessToken, refreshToken, user });
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken || null);
    return user;
  };

  const logout = async () => {
    await clearAuth();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      bootstrapping,
      isAuthenticated: !!user && !!accessToken,
      isTeacher: user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'reception',
      isParent: user?.role === 'parent',
      login,
      logout,
      setUser, // Add setUser for compatibility with web app
    }),
    [user, accessToken, refreshToken, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
