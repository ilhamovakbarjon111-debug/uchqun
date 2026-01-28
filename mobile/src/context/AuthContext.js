import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { clearAuth, getStoredAuth, storeAuth } from '../storage/authStorage';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  // TEMP STABILITY: Return safe defaults instead of throwing
  // This prevents crashes if hook is used outside provider
  if (!ctx) {
    console.warn('[useAuth] Used outside AuthProvider, returning safe defaults');
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      bootstrapping: false,
      isAuthenticated: false,
      isTeacher: false,
      isParent: false,
      login: async () => {
        console.warn('[useAuth] login called but not in provider');
        throw new Error('AuthProvider not available');
      },
      logout: async () => {
        console.warn('[useAuth] logout called but not in provider');
      },
      setUser: () => {},
      refreshUser: async () => {},
    };
  }
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

  const refreshUser = async () => {
    try {
      const resp = await api.get('/auth/me');
      const updatedUser = resp.data?.user || resp.data?.data || resp.data;
      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        const stored = await getStoredAuth();
        await storeAuth({ ...stored, user: updatedUser });
      }
    } catch (error) {
      console.error('[AuthContext] refreshUser error:', error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      bootstrapping,
      isAuthenticated: !!user && !!accessToken,
      // CRITICAL FIX: Only set isTeacher for actual 'teacher' role
      // Admin and Reception should NOT be treated as teachers to prevent crashes
      isTeacher: user?.role === 'teacher',
      isParent: user?.role === 'parent',
      // Add explicit role checks for better handling
      isAdmin: user?.role === 'admin',
      isReception: user?.role === 'reception',
      login,
      logout,
      setUser, // Add setUser for compatibility with web app
      refreshUser,
    }),
    [user, accessToken, refreshToken, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
