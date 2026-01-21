import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { DiagnosticsScreen } from '../screens/parent/DiagnosticsScreen';
import tokens from '../styles/tokens';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab configuration with joyful emojis
const TAB_CONFIG = {
  Dashboard: {
    icon: 'home',
    emoji: '🏠',
    label: 'Dashboard',
  },
  Children: {
    icon: 'people',
    emoji: '👨‍👩‍👧‍👦',
    label: 'Children',
  },
  Rating: {
    icon: 'star',
    emoji: '⭐',
    label: 'Rating',
  },
  AIChat: {
    icon: 'chatbubble-ellipses',
    emoji: '🤖',
    label: 'AI Chat',
  },
  Settings: {
    icon: 'settings',
    emoji: '⚙️',
    label: 'Settings',
  },
};

// Custom tab bar icon with emoji option
function TabIcon({ route, focused, color, size }) {
  // CRITICAL: Ensure route and route.name exist
  const routeName = route?.name;
  if (!routeName) {
    console.warn('[TabIcon] Missing route.name');
    return <Ionicons name="help-outline" size={size} color={color} />;
  }

  // CRITICAL: Safe lookup with optional chaining
  const config = TAB_CONFIG?.[routeName];

  // CRITICAL: Fallback if config missing
  if (!config) {
    console.warn(`[TabIcon] Unknown route: ${routeName}`);
    return <Ionicons name="help-outline" size={size} color={color} />;
  }

  // Use emoji for focused state, icon for unfocused
  if (focused) {
    return (
      <View style={styles.activeTabIcon}>
        <Text style={styles.tabEmoji}>{config.emoji || '📱'}</Text>
      </View>
    );
  }

  // CRITICAL: Ensure icon always exists
  const iconBase = config.icon || 'help';
  const iconName = `${iconBase}-outline`;
  return <Ionicons name={iconName} size={size} color={color} />;
}

function ParentTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const getTabLabel = (routeName) => {
    const labelMap = {
      Dashboard: t('nav.dashboard'),
      Children: t('nav.parents'),
      Rating: t('nav.rating'),
      AIChat: t('nav.aiChat'),
      Settings: t('nav.menu'),
    };
    return labelMap[routeName] || routeName;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (props) => <TabIcon route={route} {...props} />,
        tabBarActiveTintColor: tokens.colors.accent.blue,
        tabBarInactiveTintColor: tokens.colors.text.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 0,
          height: 75 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 12,
          ...tokens.shadow.card,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarLabel: getTabLabel(route.name),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Children" component={ParentsListScreen} />
      <Tab.Screen name="Rating" component={TeacherRatingScreen} />
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
      {__DEV__ && (
        <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
  },
});
