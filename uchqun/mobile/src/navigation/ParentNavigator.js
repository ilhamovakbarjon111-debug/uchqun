import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ChildProfileScreen } from '../screens/parent/ChildProfileScreen';
import { ActivitiesScreen } from '../screens/parent/ActivitiesScreen';
import { MealsScreen } from '../screens/parent/MealsScreen';
import { MediaScreen } from '../screens/parent/MediaScreen';
import { ChatScreen } from '../screens/parent/ChatScreen';
import { AIChatScreen } from '../screens/parent/AIChatScreen';
import { NotificationsScreen } from '../screens/parent/NotificationsScreen';
import { TeacherRatingScreen } from '../screens/parent/TeacherRatingScreen';
import { SchoolRatingScreen } from '../screens/parent/SchoolRatingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ParentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Meals') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Media') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Media" component={MediaScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

export function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentTabs" component={ParentTabs} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TeacherRating" component={TeacherRatingScreen} />
      <Stack.Screen name="SchoolRating" component={SchoolRatingScreen} />
    </Stack.Navigator>
  );
}
