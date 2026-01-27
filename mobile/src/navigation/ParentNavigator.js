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
import { TeacherRatingScreen } from '../screens/parent/TeacherRatingScreen';
import { SchoolRatingScreen } from '../screens/parent/SchoolRatingScreen';
import { SettingsScreen } from '../screens/parent/SettingsScreen';
import { NotificationsScreen } from '../screens/parent/NotificationsScreen';
import { TherapyScreen } from '../screens/parent/TherapyScreen';
import { PaymentsScreen } from '../screens/parent/PaymentsScreen';
import { HelpScreen } from '../screens/parent/HelpScreen';
import { AIWarningsScreen } from '../screens/parent/AIWarningsScreen';
import { DiagnosticsScreen } from '../screens/parent/DiagnosticsScreen';
import tokens from '../styles/tokens';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Icon size per Mobile-icons.md (20px)
const ICON_SIZE = 20;

// Tab configuration per Mobile-icons.md design system
const TAB_CONFIG = {
  Dashboard: {
    icon: 'home',
    label: 'Dashboard',
  },
  Rating: {
    icon: 'star',
    label: 'Rating',
  },
  Chat: {
    icon: 'chatbubble-ellipses',
    label: 'Chat',
  },
  Settings: {
    icon: 'settings',
    label: 'Settings',
  },
};

// Custom tab bar icon following Mobile-icons.md spec
function TabIcon({ route, focused, color }) {
  // CRITICAL: Ensure route and route.name exist
  const routeName = route?.name;
  if (!routeName) {
    console.warn('[TabIcon] Missing route.name');
    return <Ionicons name="help-outline" size={ICON_SIZE} color={color} />;
  }

  // CRITICAL: Safe lookup with optional chaining
  const config = TAB_CONFIG?.[routeName];

  // CRITICAL: Fallback if config missing
  if (!config) {
    console.warn(`[TabIcon] Unknown route: ${routeName}`);
    return <Ionicons name="help-outline" size={ICON_SIZE} color={color} />;
  }

  const baseIcon = config.icon || 'help';

  // Per Mobile-icons.md: Active state has navy background with white icon
  if (focused) {
    return (
      <View style={styles.activeTabIcon}>
        <Ionicons name={baseIcon} size={ICON_SIZE} color="#FFFFFF" />
      </View>
    );
  }

  // Inactive state: outline icon with muted color
  const iconName = `${baseIcon}-outline`;
  return <Ionicons name={iconName} size={ICON_SIZE} color={color} />;
}

function ParentTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const getTabLabel = (routeName) => {
    const labelMap = {
      Dashboard: t('nav.dashboard'),
      Rating: t('nav.rating'),
      Chat: t('nav.chat'),
      Settings: t('nav.menu'),
    };
    return labelMap[routeName] || routeName;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (props) => <TabIcon route={route} {...props} />,
        // Per Mobile-icons.md: Soft Navy for active, Text Tertiary for inactive
        tabBarActiveTintColor: tokens.colors.nav?.active || '#2E3A59',
        tabBarInactiveTintColor: tokens.colors.nav?.inactive || '#8F9BB3',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 0,
          height: 80 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 12,
          ...tokens.shadow.card,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarLabel: getTabLabel(route.name),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Rating" component={TeacherRatingScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
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
      <Stack.Screen name="TeacherRating" component={TeacherRatingScreen} />
      <Stack.Screen name="SchoolRating" component={SchoolRatingScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Therapy" component={TherapyScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="AIWarnings" component={AIWarningsScreen} />
      {__DEV__ && (
        <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  // Per Mobile-icons.md: Active tab has navy background, 48x48 rounded square
  activeTabIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2E3A59', // Soft Navy per Mobile-icons.md
    alignItems: 'center',
    justifyContent: 'center',
  },
});
