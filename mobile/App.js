import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

// Initialize i18n with error handling
try {
  require('./src/i18n/config');
} catch (i18nError) {
  console.error('[App] Failed to initialize i18n:', i18nError);
}

// Global error handler for unhandled promise rejections
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GlobalErrorHandler] Fatal:', isFatal);
    console.error('[GlobalErrorHandler] Error:', error);
    console.error('[GlobalErrorHandler] Stack:', error?.stack);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// Handle unhandled promise rejections
if (typeof global !== 'undefined') {
  const rejectionHandler = (reason, promise) => {
    console.error('[UnhandledRejection] Reason:', reason);
    console.error('[UnhandledRejection] Promise:', promise);
    if (reason && typeof reason === 'object') {
      console.error('[UnhandledRejection] Stack:', reason.stack);
    }
  };
  
  if (global.HermesInternal) {
    // Hermes engine
    global.HermesInternal?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: rejectionHandler,
    });
  }
  
  // Also try standard way
  if (typeof global.addEventListener === 'function') {
    global.addEventListener('unhandledrejection', (event) => {
      console.error('[UnhandledRejection] Event:', event.reason);
      event.preventDefault?.();
    });
  }
}

export default function App() {
  try {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <RootNavigator />
              </ErrorBoundary>
              <StatusBar style="auto" />
            </AuthProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[App] Render error:', error);
    // Return a minimal fallback UI
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
              App initialization failed. Please restart the app.
            </Text>
          </View>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }
}
