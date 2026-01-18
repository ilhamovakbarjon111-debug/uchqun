import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { joinUrl, WEB_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function buildLocalStorageScript({ accessToken, refreshToken, user }) {
  // Properly escape strings for JavaScript injection
  const escapeJsString = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  };

  const safeUser = JSON.stringify(user || null);
  const at = escapeJsString(accessToken || '');
  const rt = escapeJsString(refreshToken || '');

  return `
    (function() {
      try {
        console.log('[Mobile] Starting localStorage injection');
        
        // Clear old auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Set new auth data
        if ('${at}') {
          localStorage.setItem('accessToken', '${at}');
          console.log('[Mobile] accessToken set, length:', '${at}'.length);
        }
        if ('${rt}') {
          localStorage.setItem('refreshToken', '${rt}');
          console.log('[Mobile] refreshToken set');
        }
        localStorage.setItem('user', ${safeUser});
        console.log('[Mobile] user set:', ${safeUser ? 'true' : 'false'});
        
        // Verify localStorage was set
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        const storedRefresh = localStorage.getItem('refreshToken');
        console.log('[Mobile] Verification - accessToken:', storedToken ? 'exists (' + storedToken.length + ' chars)' : 'missing');
        console.log('[Mobile] Verification - refreshToken:', storedRefresh ? 'exists' : 'missing');
        console.log('[Mobile] Verification - user:', storedUser ? 'exists' : 'missing');
        
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            console.log('[Mobile] User parsed successfully:', userObj?.email, 'Role:', userObj?.role);
          } catch (e) {
            console.error('[Mobile] Failed to parse user:', e);
          }
        }
        
        // Notify web app with storage event - multiple events to ensure AuthContext catches it
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: ${safeUser},
          oldValue: null
        }));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: '${at}',
          oldValue: null
        }));
        
        // Force AuthContext to re-read localStorage by triggering events
        // Multiple events to ensure AuthContext catches it
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { user: ${safeUser}, accessToken: '${at}' }
        }));
        
        // Also try to directly update AuthContext if it's available
        // Check if React app is mounted and try to update AuthContext
        setTimeout(function() {
          try {
            // Try to find React root and trigger a re-render
            const root = document.getElementById('root');
            if (root && root._reactRootContainer) {
              console.log('[Mobile] React root found, triggering update');
              // Force a re-render by dispatching storage event again
              window.dispatchEvent(new Event('storage'));
            }
          } catch (e) {
            console.log('[Mobile] Could not trigger React update:', e);
          }
        }, 100);
        
        // Don't reload - it causes infinite loop
        // Instead, just log the state
        setTimeout(function() {
          try {
            const root = document.getElementById('root');
            // Check if page is still loading (empty or minimal content)
            if (root && root.innerHTML.length < 1000) {
              const storedUser = localStorage.getItem('user');
              const storedToken = localStorage.getItem('accessToken');
              if (storedUser && storedToken) {
                console.log('[Mobile] AuthContext might be stuck, but not reloading to avoid loop');
                console.log('[Mobile] Root content length:', root.innerHTML.length);
                // Don't reload - it causes infinite loop
              }
            }
          } catch (e) {
            console.log('[Mobile] State check error:', e);
          }
        }, 1500);
        
        // Only redirect if on login page after a delay (allow page to render first)
        setTimeout(function() {
          try {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath === '/login' || currentPath.includes('/login');
            
            if (isLoginPage && ${safeUser}) {
              const userObj = JSON.parse(${safeUser});
              const role = userObj?.role;
              let targetPath = '/';
              
              // Determine target path based on role
              if (role === 'teacher' || role === 'admin' || role === 'reception') {
                targetPath = '/teacher';
              } else if (role === 'parent') {
                targetPath = '/';
              }
              
              console.log('[Mobile] On login page, redirecting to:', targetPath);
              
              // Double check we're still on login page
              if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                window.location.href = window.location.origin + targetPath;
              }
            }
          } catch (e) {
            console.error('[Mobile] Redirect error:', e);
          }
        }, 500);
      } catch (e) {
        console.error('[Mobile] localStorage injection error:', e);
        console.error('[Mobile] Error details:', e.message, e.stack);
      }
    })();
    true;
  `;
}

export function WebAppScreen() {
  const webRef = useRef(null);
  const { user, accessToken, refreshToken, logout, isTeacher } = useAuth();
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(null);
  const injectedRef = useRef(false);
  const reloadingRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const injectionCountRef = useRef(0);
  const maxInjectionCount = 3; // Limit injection attempts

  // Determine start URL based on user role
  const startUrl = useMemo(() => {
    // Ensure we have at least basic values
    const webUrl = WEB_URL || process.env.EXPO_PUBLIC_WEB_URL || 'https://uchqun-platform.netlify.app';
    
    if (!webUrl || webUrl === 'undefined' || webUrl === 'null') {
      console.error('[WebAppScreen] WEB_URL is not defined or invalid:', webUrl);
      return null;
    }
    
    // Determine path based on role
    let path = '/';
    if (isTeacher) {
      path = '/teacher';
    } else if (user?.role === 'parent') {
      path = '/';
    } else if (!user) {
      path = '/login';
    }
    
    // Build URL safely
    let url;
    try {
      url = joinUrl(webUrl, path);
      if (!url || url === 'undefined' || url === 'null') {
        throw new Error('Invalid URL after joinUrl');
      }
    } catch (error) {
      console.error('[WebAppScreen] Error building URL:', error);
      // Fallback to direct URL construction
      const base = String(webUrl).replace(/\/+$/, '');
      const cleanPath = String(path).startsWith('/') ? path : '/' + path;
      url = `${base}${cleanPath}`;
    }
    
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${separator}_t=${Date.now()}&_v=1.0.0&_mobile=true`;
    
    console.log('[WebAppScreen] WEB_URL:', webUrl);
    console.log('[WebAppScreen] Path:', path);
    console.log('[WebAppScreen] Start URL:', fullUrl);
    console.log('[WebAppScreen] User:', user?.email, 'Role:', user?.role);
    console.log('[WebAppScreen] AccessToken exists:', !!accessToken);
    console.log('[WebAppScreen] User exists:', !!user);
    console.log('[WebAppScreen] IsTeacher:', isTeacher);
    
    // Validate URL format
    try {
      new URL(fullUrl);
    } catch (error) {
      console.error('[WebAppScreen] Invalid URL format:', fullUrl, error);
      return null;
    }
    
    return fullUrl;
  }, [isTeacher, user, accessToken]);

  // Show error if URL cannot be determined
  if (!startUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Xatolik</Text>
          <Text style={styles.errorText}>Web URL aniqlanmadi</Text>
        </View>
      </View>
    );
  }

  // Build localStorage injection script
  const localStorageScript = useMemo(
    () => buildLocalStorageScript({ accessToken, refreshToken, user }),
    [accessToken, refreshToken, user]
  );

  // Also inject after component mounts as fallback
  useEffect(() => {
    if (webRef.current && accessToken && user && !injectedRef.current) {
      // Wait a bit for WebView to be ready
      const timer = setTimeout(() => {
        if (webRef.current && !injectedRef.current) {
          injectedRef.current = true;
          console.log('[WebAppScreen] Injecting localStorage via useEffect (fallback)');
          webRef.current.injectJavaScript(localStorageScript);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else if (!accessToken || !user) {
      // Reset injection flag if auth is lost
      injectedRef.current = false;
    }
  }, [localStorageScript, accessToken, user]);

  // Handle messages from WebView (logout, etc.)
  const handleMessage = useCallback(
    async (event) => {
      try {
        const data = event?.nativeEvent?.data;
        if (!data) return;
        const msg = JSON.parse(data);
        console.log('[WebAppScreen] Received message from WebView:', msg);
        
        if (msg?.type === 'logout' || msg?.type === 'sessionExpired') {
          console.log('[WebAppScreen] Logging out user');
          await logout();
        } else if (msg?.type === 'pageReady') {
          // Page is ready, hide loading
          console.log('[WebAppScreen] Page is ready, hiding loading');
          setWebLoading(false);
        }
      } catch (error) {
        // Ignore non-JSON messages
        console.log('[WebAppScreen] Message parse error (non-JSON):', error);
      }
    },
    [logout]
  );

  // Handle page load end - hide loading and verify localStorage
  const handleLoadEnd = useCallback(() => {
    console.log('[WebAppScreen] handleLoadEnd called');
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Verify localStorage was set correctly (don't inject again, it's already injected via injectedJavaScriptBeforeContentLoaded)
    if (webRef.current && accessToken && user) {
      console.log('[WebAppScreen] Verifying localStorage in handleLoadEnd');
      console.log('[WebAppScreen] User email:', user?.email, 'Role:', user?.role);
      
      // Create a simple verification script (don't re-inject, it's already done via injectedJavaScriptBeforeContentLoaded)
      const verifyScript = `
        (function() {
          console.log('[Mobile] Verifying localStorage after page load');
          
          const token = localStorage.getItem('accessToken');
          const storedUser = localStorage.getItem('user');
          const storedRefresh = localStorage.getItem('refreshToken');
          
          console.log('[Mobile] Verification - token:', token ? 'exists (' + token.length + ' chars)' : 'MISSING');
          console.log('[Mobile] Verification - user:', storedUser ? 'exists' : 'MISSING');
          console.log('[Mobile] Verification - refreshToken:', storedRefresh ? 'exists' : 'MISSING');
          
          // Check page content
          const root = document.getElementById('root');
          if (root) {
            console.log('[Mobile] Root element found, innerHTML length:', root.innerHTML.length);
            if (root.innerHTML.length < 1000) {
              console.log('[Mobile] WARNING: Root content is small, might be loading...');
            }
          }
          
          // Parse and log user if exists
          if (storedUser) {
            try {
              const userObj = JSON.parse(storedUser);
              console.log('[Mobile] User parsed:', userObj?.email, 'Role:', userObj?.role);
            } catch (e) {
              console.error('[Mobile] Failed to parse user:', e);
            }
          }
        })();
        true;
      `;
      
      // Only verify (don't inject, it's already injected via injectedJavaScriptBeforeContentLoaded)
      setTimeout(() => {
        if (webRef.current && accessToken && user) {
          console.log('[WebAppScreen] Verifying localStorage');
          webRef.current.injectJavaScript(verifyScript);
        }
      }, 500);
    } else {
      console.log('[WebAppScreen] Skipping injection - no auth data');
      console.log('[WebAppScreen] accessToken exists:', !!accessToken);
      console.log('[WebAppScreen] user exists:', !!user);
    }
    
    // Hide loading after a delay - but check page state first
    setTimeout(() => {
      // Check if page has content before hiding loading
      if (webRef.current) {
        const checkContentScript = `
          (function() {
            const root = document.getElementById('root');
            const hasContent = root && root.innerHTML.length > 1000;
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('accessToken');
            console.log('[Mobile] Content check - root exists:', !!root, 'hasContent:', hasContent, 'contentLength:', root?.innerHTML.length);
            console.log('[Mobile] Auth check - user:', !!storedUser, 'token:', !!storedToken);
            if (hasContent) {
              console.log('[Mobile] Page has content, sending pageReady message');
              window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'pageReady' }));
            } else {
              console.log('[Mobile] Page still loading or empty, will check again...');
              // Check again after 1 second
              setTimeout(function() {
                const root2 = document.getElementById('root');
                const hasContent2 = root2 && root2.innerHTML.length > 1000;
                if (hasContent2) {
                  console.log('[Mobile] Page loaded on second check');
                  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'pageReady' }));
                } else {
                  console.log('[Mobile] Page still empty after 1s, might be AuthContext loading issue');
                }
              }, 1000);
            }
          })();
          true;
        `;
        webRef.current.injectJavaScript(checkContentScript);
      }
      
      // Hide loading anyway after timeout (but keep checking)
      setTimeout(() => {
        setWebLoading(false);
      }, 3000);
    }, 2000);
  }, [localStorageScript, accessToken, user, refreshToken]);

  // Force WebView remount when auth changes
  const webViewKey = useMemo(() => {
    return `webview-${user?.id || 'none'}-${accessToken?.substring(0, 8) || 'none'}`;
  }, [user?.id, accessToken]);

  // Reset injection flag when WebView remounts
  useEffect(() => {
    injectedRef.current = false;
    reloadingRef.current = false;
    injectionCountRef.current = 0; // Reset injection count
    console.log('[WebAppScreen] WebView key changed, resetting flags');
  }, [webViewKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Log when component mounts/updates
  useEffect(() => {
    console.log('[WebAppScreen] Component rendered');
    console.log('[WebAppScreen] startUrl:', startUrl);
    console.log('[WebAppScreen] webLoading:', webLoading);
    console.log('[WebAppScreen] user:', user?.email);
    console.log('[WebAppScreen] accessToken:', !!accessToken);
  });

  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey}
        ref={webRef}
        source={{ uri: startUrl }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={localStorageScript}
        injectedJavaScript={undefined}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        originWhitelist={['*']}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        onLoadStart={() => {
          console.log('[WebAppScreen] onLoadStart');
          setWebError(null);
          setWebLoading(true);
          injectedRef.current = false; // Reset injection flag on new load
          
          // Inject localStorage immediately on load start (before content loads)
          // This ensures localStorage is set before AuthContext mounts
          if (webRef.current && accessToken && user) {
            setTimeout(() => {
              if (webRef.current && accessToken && user) {
                console.log('[WebAppScreen] Injecting localStorage on load start');
                webRef.current.injectJavaScript(localStorageScript);
              }
            }, 50);
          }
          
          // Clear any existing timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          // Force hide loading after 15 seconds max
          loadingTimeoutRef.current = setTimeout(() => {
            console.log('[WebAppScreen] Loading timeout - forcing hide');
            setWebLoading(false);
          }, 15000);
        }}
        onLoadEnd={handleLoadEnd}
        onLoad={() => {
          console.log('[WebAppScreen] onLoad - page fully loaded');
          // Inject a script to check page state and localStorage
          if (webRef.current) {
            const checkScript = `
              (function() {
                console.log('[Mobile] ========== PAGE LOADED CHECK ==========');
                console.log('[Mobile] Document ready state:', document.readyState);
                console.log('[Mobile] Document body:', document.body ? 'exists' : 'missing');
                console.log('[Mobile] Window location:', window.location.href);
                
                // Check localStorage
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('accessToken');
                const storedRefresh = localStorage.getItem('refreshToken');
                console.log('[Mobile] localStorage user:', storedUser ? 'exists (' + storedUser.length + ' chars)' : 'MISSING');
                console.log('[Mobile] localStorage token:', storedToken ? 'exists (' + storedToken.length + ' chars)' : 'MISSING');
                console.log('[Mobile] localStorage refreshToken:', storedRefresh ? 'exists' : 'MISSING');
                
                if (storedUser) {
                  try {
                    const userObj = JSON.parse(storedUser);
                    console.log('[Mobile] User parsed:', userObj?.email, 'Role:', userObj?.role);
                  } catch (e) {
                    console.error('[Mobile] Failed to parse user:', e);
                  }
                }
                
                // Check if React app is mounted
                const root = document.getElementById('root');
                console.log('[Mobile] Root element:', root ? 'exists' : 'missing');
                if (root) {
                  console.log('[Mobile] Root children:', root.children.length);
                  console.log('[Mobile] Root innerHTML length:', root.innerHTML.length);
                  if (root.innerHTML.length < 1000) {
                    console.log('[Mobile] WARNING: Root content is very small, might be loading...');
                  }
                }
                console.log('[Mobile] =========================================');
              })();
              true;
            `;
            setTimeout(() => {
              if (webRef.current) {
                console.log('[WebAppScreen] Injecting page check script');
                webRef.current.injectJavaScript(checkScript);
              }
            }, 500);
          }
        }}
        onConsoleMessage={(e) => {
          // Forward ALL WebView console logs to React Native console for debugging
          const message = e?.nativeEvent?.message || '';
          const level = e?.nativeEvent?.level || 'log';
          const sourceId = e?.nativeEvent?.sourceId || 'unknown';
          
          // Log ALL console messages for debugging - especially Mobile and WebView logs
          // Always log [Mobile] messages, errors, and warnings
          if (message.includes('[Mobile]') || level === 'error' || level === 'warn') {
            console.log(`[WebView-${sourceId}] [${level}]`, message);
          }
          
          // Also log important messages
          if (message.includes('localStorage') || message.includes('Verification') || message.includes('User parsed')) {
            console.log(`[WebView-${sourceId}] [${level}]`, message);
          }
          
          if (level === 'error') {
            console.error('[WebView ERROR]', message);
          }
        }}
        onLoadProgress={(e) => {
          const progress = e?.nativeEvent?.progress;
          console.log('[WebAppScreen] Load progress:', Math.round(progress * 100) + '%');
          if (progress >= 1) {
            console.log('[WebAppScreen] Load progress 100%');
            // Don't set loading here - handleLoadEnd will handle it
          }
        }}
        onContentSizeChange={(e) => {
          const { width, height } = e.nativeEvent;
          console.log('[WebAppScreen] Content size changed:', width, 'x', height);
        }}
        onRenderProcessGone={(e) => {
          console.error('[WebAppScreen] Render process gone:', e.nativeEvent.didCrash);
          setWebError('WebView crashed. Please reload.');
        }}
        onError={(e) => {
          const errorDesc = e?.nativeEvent?.description || 'Web error';
          const errorCode = e?.nativeEvent?.code;
          console.error('[WebAppScreen] WebView Error:', errorDesc);
          console.error('[WebAppScreen] Error Code:', errorCode);
          console.error('[WebAppScreen] Current URL:', startUrl);
          console.error('[WebAppScreen] WEB_URL config:', WEB_URL);
          
          // Provide more helpful error message
          let userFriendlyError = errorDesc;
          if (errorDesc.includes('ERR_TIMED_OUT') || errorDesc.includes('TIMED_OUT')) {
            userFriendlyError = 'Tarmoq ulanishi sekin yoki yo\'q. Internet aloqasini tekshiring.';
          } else if (errorDesc.includes('ERR_NAME_NOT_RESOLVED') || errorDesc.includes('undefined')) {
            userFriendlyError = 'URL noto\'g\'ri. Iltimos, ilovani qayta ishga tushiring.';
          } else if (errorDesc.includes('ERR_CONNECTION_REFUSED')) {
            userFriendlyError = 'Serverga ulanib bo\'lmadi. Iltimos, keyinroq urinib ko\'ring.';
          }
          
          setWebError(userFriendlyError);
          setWebLoading(false);
          // Clear loading timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        }}
        onHttpError={(e) => {
          const statusCode = e?.nativeEvent?.statusCode;
          console.error('[WebAppScreen] HTTP Error:', statusCode);
          if (statusCode === 404 || statusCode >= 500) {
            setWebError(`HTTP ${statusCode}: ${statusCode === 404 ? 'Sahifa topilmadi' : 'Server xatosi'}`);
          } else if (statusCode === 401) {
            // 401 means unauthorized - might need to re-authenticate
            console.log('[WebAppScreen] 401 Unauthorized - session may have expired');
            setWebError('Sessiya muddati tugadi. Qayta kirish kerak.');
          }
          setWebLoading(false);
          // Clear loading timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        }}
        onMessage={handleMessage}
        onNavigationStateChange={(navState) => {
          // Prevent redirect to /login if user is authenticated
          const url = navState?.url || '';
          // Only block if we're actually navigating to login (not just loading)
          if (url.includes('/login') && accessToken && user && !reloadingRef.current && !url.includes('_mobile=true')) {
            console.log('[WebAppScreen] Blocking login redirect, URL:', url);
            reloadingRef.current = true;
            // Inject localStorage and redirect to home - but only once
            setTimeout(() => {
              if (webRef.current && reloadingRef.current) {
                webRef.current?.injectJavaScript(localStorageScript);
                setTimeout(() => {
                  if (webRef.current && reloadingRef.current) {
                    let targetPath = '/';
                    if (isTeacher) {
                      targetPath = '/teacher';
                    } else if (user?.role === 'parent') {
                      targetPath = '/';
                    }
                    const currentUrl = webRef.current?.getUrl?.() || '';
                    // Only redirect if still on login page
                    if (currentUrl.includes('/login') && !currentUrl.includes(targetPath)) {
                      console.log('[WebAppScreen] Redirecting from login to:', targetPath);
                      webRef.current?.injectJavaScript(`
                        if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                          window.location.href = window.location.origin + '${targetPath}';
                        }
                        true;
                      `);
                    }
                    // Reset flag after delay
                    setTimeout(() => {
                      reloadingRef.current = false;
                    }, 1000);
                  }
                }, 200);
              }
            }, 100);
          } else {
            // Reset flag if not blocking
            if (!url.includes('/login')) {
              reloadingRef.current = false;
            }
          }
        }}
        onShouldStartLoadWithRequest={(req) => {
          // Block navigation to /login if authenticated - but be careful not to cause loops
          const url = req?.url || '';
          if (url.includes('/login') && accessToken && user && !reloadingRef.current && !url.includes('_mobile=true')) {
            console.log('[WebAppScreen] Blocking login navigation, URL:', url);
            // Don't block if it's the initial load or if we're already redirecting
            if (url === startUrl || reloadingRef.current) {
              return true;
            }
            reloadingRef.current = true;
            // Inject localStorage and redirect - but only once
            setTimeout(() => {
              if (webRef.current && reloadingRef.current) {
                webRef.current?.injectJavaScript(localStorageScript);
                setTimeout(() => {
                  if (webRef.current && reloadingRef.current) {
                    let targetPath = '/';
                    if (isTeacher) {
                      targetPath = '/teacher';
                    } else if (user?.role === 'parent') {
                      targetPath = '/';
                    }
                    console.log('[WebAppScreen] Redirecting to:', targetPath);
                    webRef.current?.injectJavaScript(`
                      if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                        window.location.href = window.location.origin + '${targetPath}';
                      }
                      true;
                    `);
                    // Reset flag after delay
                    setTimeout(() => {
                      reloadingRef.current = false;
                    }, 1000);
                  }
                }, 200);
              }
            }, 100);
            return false;
          }
          // Reset flag if not blocking
          if (!url.includes('/login')) {
            reloadingRef.current = false;
          }
          return true;
        }}
        onPermissionRequest={(request) => {
          // Grant camera permission for scanner
          if (request.nativeEvent.permission === 'camera') {
            request.nativeEvent.request.grant();
          } else {
            request.nativeEvent.request.deny();
          }
        }}
      />

      {webLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      )}

      {webError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Xatolik</Text>
          <Text style={styles.errorText}>{webError}</Text>
          <View style={styles.errorActions}>
            <Pressable
              onPress={() => {
                setWebError(null);
                setWebLoading(true);
                if (webRef.current) {
                  webRef.current.reload();
                }
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Qayta urinish</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setWebError(null);
                setWebLoading(true);
                // Force remount WebView by changing key
                if (webRef.current) {
                  webRef.current.reload();
                }
              }}
              style={[styles.retryButton, styles.retryButtonSecondary]}
            >
              <Text style={styles.retryButtonText}>To'liq qayta yuklash</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
    opacity: 1,
    minHeight: 400, // Ensure minimum height
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 4,
    fontSize: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonSecondary: {
    backgroundColor: '#6b7280',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
