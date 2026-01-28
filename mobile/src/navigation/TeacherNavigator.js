import React from 'react';
import { View } from 'react-native';
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
import { SettingsScreen } from '../screens/teacher/SettingsScreen';
import { NotificationsScreen } from '../screens/teacher/NotificationsScreen';
import { EmotionalMonitoringScreen } from '../screens/teacher/EmotionalMonitoringScreen';
import { TherapyScreen } from '../screens/teacher/TherapyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import theme from '../styles/theme';

// Icon size per Mobile-icons.md (20px)
const ICON_SIZE = 20;

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
            return <Ionicons name="help-outline" size={ICON_SIZE} color={color} />;
          }

          // Icon mapping per Mobile-icons.md design system
          const iconMap = {
            Dashboard: 'home',      // Home icon
            Parents: 'people',      // Users icon
            Chat: 'chatbubble-ellipses', // Chat icon
            Settings: 'settings',   // Settings icon
          };

          const baseIcon = iconMap[routeName] || 'help';
          const iconName = focused ? baseIcon : `${baseIcon}-outline`;

          // Per Mobile-icons.md: Active state has navy background with white icon
          if (focused) {
            return (
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: theme.Colors.navigation.activeBackground,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name={baseIcon} size={ICON_SIZE} color="#FFFFFF" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={ICON_SIZE} color={color} />;
        },
        tabBarActiveTintColor: theme.Colors.navigation.active,
        tabBarInactiveTintColor: theme.Colors.navigation.inactive,
        tabBarStyle: {
          backgroundColor: theme.Colors.navigation.background,
          borderTopWidth: 1,
          borderTopColor: theme.Colors.border.light,
          height: 80 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 12,
          ...theme.Colors.shadow.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
      <Tab.Screen name="Parents" component={ParentsListScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
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
      <Stack.Screen name="EmotionalMonitoring" component={EmotionalMonitoringScreen} />
      <Stack.Screen name="Therapy" component={TherapyScreen} />
    </Stack.Navigator>
  );
}
