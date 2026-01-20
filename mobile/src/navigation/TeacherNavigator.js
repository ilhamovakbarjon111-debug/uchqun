import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import theme from '../styles/theme';

function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Parents') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Meals') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Media') {
            iconName = focused ? 'images' : 'images-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.Colors.navigation.active,
        tabBarInactiveTintColor: theme.Colors.navigation.inactive,
        tabBarStyle: {
          backgroundColor: theme.Colors.navigation.background,
          borderTopWidth: 1,
          borderTopColor: theme.Colors.border.light,
          height: 70,
          paddingBottom: 10,
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
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Media" component={MediaScreen} />
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
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
