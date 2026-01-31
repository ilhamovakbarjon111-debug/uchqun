import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../screens/LoadingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ParentNavigator } from './ParentNavigator';
import { TeacherNavigator } from './TeacherNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { bootstrapping, isAuthenticated, user, isTeacher, isParent } = useAuth();
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
          let targetRoute = 'Login';
          if (isAuthenticated) {
            if (isTeacher) {
              targetRoute = 'Teacher';
            } else if (isParent) {
              targetRoute = 'Parent';
            }
          }
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
  }, [isAuthenticated, bootstrapping, user, isTeacher, isParent]);

  if (bootstrapping) {
    return <LoadingScreen />;
  }

  // Determine initial route
  let initialRoute = 'Login';
  if (isAuthenticated) {
    if (isTeacher) {
      initialRoute = 'Teacher';
    } else if (isParent) {
      initialRoute = 'Parent';
    }
  }
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
          name="Parent" 
          component={ParentNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Teacher" 
          component={TeacherNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
