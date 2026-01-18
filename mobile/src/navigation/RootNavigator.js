import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../screens/LoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { WebAppScreen } from '../screens/WebAppScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { bootstrapping, isAuthenticated, user } = useAuth();
  const navigationRef = useRef(null);
  const prevAuthRef = useRef(undefined);

  // Handle navigation when auth state changes
  useEffect(() => {
    if (bootstrapping) {
      prevAuthRef.current = undefined;
      return;
    }

    // Initialize on first render
    if (prevAuthRef.current === undefined) {
      prevAuthRef.current = isAuthenticated;
      return;
    }

    // Skip if auth state hasn't changed
    if (prevAuthRef.current === isAuthenticated) return;

    prevAuthRef.current = isAuthenticated;

    // Navigate after a short delay to ensure state is ready
    const timer = setTimeout(() => {
      if (navigationRef.current) {
        try {
          const targetRoute = isAuthenticated ? 'WebApp' : 'Login';
          console.log('[RootNavigator] Navigating to:', targetRoute);
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: targetRoute }],
            })
          );
        } catch (error) {
          console.error('[RootNavigator] Navigation error:', error);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, bootstrapping, user]);

  if (bootstrapping) {
    return <LoadingScreen />;
  }

  // Determine initial route
  const initialRoute = isAuthenticated ? 'WebApp' : 'Login';
  console.log('[RootNavigator] Initial route:', initialRoute, 'User:', user?.email, 'Role:', user?.role);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animationTypeForReplace: isAuthenticated ? 'pop' : 'push',
          }}
        />
        <Stack.Screen 
          name="WebApp" 
          component={WebAppScreen}
          options={{
            gestureEnabled: false, // Prevent back gesture on main app screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
