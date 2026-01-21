import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import './src/i18n/config'; // Initialize i18n

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
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
