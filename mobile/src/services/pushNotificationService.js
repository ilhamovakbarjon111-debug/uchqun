import { Platform } from 'react-native';
import { api } from './api';

let Notifications = null;
let Device = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch (e) {
  console.warn('[PushNotification] expo-notifications or expo-device not installed');
}

export async function registerForPushNotifications() {
  if (!Notifications || !Device) return null;
  if (!Device.isDevice) {
    console.warn('[PushNotification] Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PushNotification] Permission not granted');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  // Register with backend
  try {
    await api.post('/push-notifications/register', {
      deviceToken: token,
      platform: Platform.OS,
    });
  } catch (error) {
    console.error('[PushNotification] Failed to register token:', error);
  }

  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  return token;
}

export async function unregisterPushNotifications() {
  if (!Notifications) return;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await api.delete(`/push-notifications/device/${encodeURIComponent(tokenData.data)}`);
  } catch (error) {
    console.error('[PushNotification] Failed to unregister:', error);
  }
}
