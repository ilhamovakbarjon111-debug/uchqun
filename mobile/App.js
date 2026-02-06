import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NetworkBanner } from './src/components/common/NetworkBanner';
import { i18nReady } from './src/i18n/config';

// Global error handler for unhandled promise rejections
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GlobalErrorHandler]', error, { isFatal });
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export default function App() {
  const [i18nLoaded, setI18nLoaded] = useState(false);

  useEffect(() => {
    i18nReady.then(() => setI18nLoaded(true)).catch(() => setI18nLoaded(true));
  }, []);

  if (!i18nLoaded) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>
                <NotificationProvider>
                <ErrorBoundary>
                  <NetworkBanner />
                  <RootNavigator />
                </ErrorBoundary>
                <StatusBar style="auto" />
                </NotificationProvider>
              </ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
