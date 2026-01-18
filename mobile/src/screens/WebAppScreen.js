import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { joinUrl, WEB_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function buildLocalStorageBootstrap({ accessToken, refreshToken, user }) {
  const safeUser = JSON.stringify(user || null).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const at = String(accessToken || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const rt = String(refreshToken || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  // Note: return true; is required for Android WebView injected JS.
  return `
    (function() {
      try {
        localStorage.setItem('accessToken', '${at}');
        if ('${rt}') localStorage.setItem('refreshToken', '${rt}');
        localStorage.setItem('user', '${safeUser}');
      } catch (e) {}
    })();
    true;
  `;
}

export function WebAppScreen() {
  const webRef = useRef(null);
  const { user, accessToken, refreshToken, logout } = useAuth();
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState('');
  const loadTimeoutRef = useRef(null);

  const startUrl = useMemo(() => {
    const role = user?.role;
    // Parent: / (Dashboard), Teacher: /teacher, Admin: /teacher
    const path = role === 'teacher' || role === 'admin' || role === 'reception' ? '/teacher' : '/';
    return joinUrl(WEB_URL, path);
  }, [user]);

  const injectedBeforeLoad = useMemo(
    () => buildLocalStorageBootstrap({ accessToken, refreshToken, user }),
    [accessToken, refreshToken, user]
  );

  const handleMessage = useCallback(
    async (event) => {
      const raw = event?.nativeEvent?.data;
      if (!raw) return;
      try {
        const msg = JSON.parse(raw);
        if (msg?.type === 'logout' || msg?.type === 'sessionExpired') {
          await logout();
        }
      } catch {
        // ignore non-JSON
      }
    },
    [logout]
  );

  const maybeInterceptLogin = useCallback(
    async (url) => {
      try {
        const u = String(url || '');
        if (u.includes('/login')) {
          // Don't block the navigation here; just invalidate session.
          // RootNavigator will switch to native Login screen.
          await logout();
          return true;
        }
      } catch {}
      return false;
    },
    [logout]
  );

  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: startUrl }}
        // Dev-only: avoid stale web assets/styles during iteration
        // (In production, keep caching for speed.)
        incognito={__DEV__}
        domStorageEnabled
        javaScriptEnabled
        cacheEnabled={!__DEV__}
        cacheMode={__DEV__ ? 'LOAD_NO_CACHE' : 'LOAD_DEFAULT'}
        // Mobile optimizations
        allowsBackForwardNavigationGestures={true}
        sharedCookiesEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectedBeforeLoad}
        onLoadStart={() => {
          setWebError('');
          setWebLoading(true);
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          // Fallback: if load events don't fire (WebView edge-cases), don't keep spinner forever.
          loadTimeoutRef.current = setTimeout(() => setWebLoading(false), 12000);
        }}
        onLoadProgress={(e) => {
          const p = e?.nativeEvent?.progress;
          if (typeof p === 'number' && p >= 1) setWebLoading(false);
        }}
        onLoadEnd={() => {
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          setWebLoading(false);
        }}
        onError={(e) => {
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          setWebError(e?.nativeEvent?.description || 'Web error');
          setWebLoading(false);
        }}
        onHttpError={(e) => {
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          setWebError(`HTTP ${e?.nativeEvent?.statusCode || ''}`);
          setWebLoading(false);
        }}
        onMessage={handleMessage}
        onNavigationStateChange={(navState) => {
          if (navState?.url) maybeInterceptLogin(navState.url);
          if (typeof navState?.loading === 'boolean') setWebLoading(navState.loading);
        }}
        onShouldStartLoadWithRequest={(req) => {
          // If web redirects to /login, treat as logged out and stop navigating there.
          if (req?.url && req.url.includes('/login')) {
            // Allow the request; native navigation will take over right after logout.
            maybeInterceptLogin(req.url);
            return true;
          }
          return true;
        }}
      />

      {webLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" />
        </View>
      )}

      {!!webError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Web ochilmadi</Text>
          <Text style={styles.errorText}>{webError}</Text>
          <Text style={styles.errorTextSmall}>
            WEB_URL noto‘g‘ri bo‘lishi mumkin. Expo env: EXPO_PUBLIC_WEB_URL
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  errorBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderWidth: 1,
  },
  errorTitle: { fontWeight: '800', color: '#9a3412', marginBottom: 4 },
  errorText: { color: '#9a3412' },
  errorTextSmall: { marginTop: 6, color: '#7c2d12', fontSize: 12 },
});

