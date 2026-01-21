import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TeacherDashboardScreen } from '../screens/teacher/TeacherDashboardScreen';
import { ProfileScreen } from '../screens/teacher/ProfileScreen';
import { ResponsibilitiesScreen } from '../screens/teacher/ResponsibilitiesScreen';
import { TasksScreen } from '../screens/teacher/TasksScreen';
import { WorkHistoryScreen } from '../screens/teacher/WorkHistoryScreen';
import { ParentsListScreen } from '../screens/teacher/ParentsListScreen';
import { ParentDetailScreen } from '../screens/teacher/ParentDetailScreen';
import { ActivitiesScreen } from '../screens/teacher/ActivitiesScreen';
import { MealsScreen } from '../screens/teacher/MealsScreen';
import { MediaScreen } from '../screens/teacher/MediaScreen';
import { ChatScreen } from '../screens/teacher/ChatScreen';
import { NotificationsScreen } from '../screens/parent/NotificationsScreen';
import { SettingsScreen } from '../screens/teacher/SettingsScreen';
import { AIChatScreen } from '../screens/parent/AIChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import theme from '../styles/theme';

function TeacherTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // CRITICAL: Safe route name access
          const routeName = route?.name;
          if (!routeName) {
            console.warn('[TeacherTabIcon] Missing route.name');
            return <Ionicons name="help-outline" size={size} color={color} />;
          }

          // CRITICAL: Safe icon name with fallback
          let iconName = 'help-outline'; // Default fallback

          if (routeName === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (routeName === 'Parents') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (routeName === 'AIChat') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (routeName === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.Colors.navigation.active,
        tabBarInactiveTintColor: theme.Colors.navigation.inactive,
        tabBarStyle: {
          backgroundColor: theme.Colors.navigation.background,
          borderTopWidth: 1,
          borderTopColor: theme.Colors.border.light,
          height: 70 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          ...theme.Colors.shadow.md,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
      <Tab.Screen name="Parents" component={ParentsListScreen} />
      <Tab.Screen name="AIChat" component={AIChatScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function TeacherNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Responsibilities" component={ResponsibilitiesScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="WorkHistory" component={WorkHistoryScreen} />
      <Stack.Screen name="ParentDetail" component={ParentDetailScreen} />
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
      <Stack.Screen name="Meals" component={MealsScreen} />
      <Stack.Screen name="Media" component={MediaScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
