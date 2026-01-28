import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../config';

export async function getStoredAuth() {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.accessToken).catch(() => null),
    SecureStore.getItemAsync(STORAGE_KEYS.refreshToken).catch(() => null),
    AsyncStorage.getItem(STORAGE_KEYS.user),
  ]);

  const user = userRaw ? safeJsonParse(userRaw) : null;
  return { accessToken, refreshToken, user };
}

export async function storeAuth({ accessToken, refreshToken, user }) {
  const ops = [
    SecureStore.setItemAsync(STORAGE_KEYS.accessToken, accessToken || ''),
    AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user || null)),
  ];
  if (refreshToken) ops.push(SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken));
  await Promise.all(ops);
}

export async function clearAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken).catch(() => {}),
    SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken).catch(() => {}),
    AsyncStorage.removeItem(STORAGE_KEYS.user),
  ]);
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
