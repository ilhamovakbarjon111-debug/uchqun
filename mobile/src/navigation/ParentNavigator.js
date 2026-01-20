import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { SettingsScreen } from '../screens/parent/SettingsScreen';
import { ParentsListScreen } from '../screens/parent/ParentsListScreen';
import theme from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ParentTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Children') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AIChat') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Settings') {
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
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Children" component={ParentsListScreen} />
      <Tab.Screen name="AIChat" component={AIChatScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentTabs" component={ParentTabs} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
      <Stack.Screen name="Meals" component={MealsScreen} />
      <Stack.Screen name="Media" component={MediaScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TeacherRating" component={TeacherRatingScreen} />
      <Stack.Screen name="SchoolRating" component={SchoolRatingScreen} />
    </Stack.Navigator>
  );
}
