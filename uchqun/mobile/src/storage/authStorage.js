import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';

export async function getStoredAuth() {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.accessToken),
    AsyncStorage.getItem(STORAGE_KEYS.refreshToken),
    AsyncStorage.getItem(STORAGE_KEYS.user),
  ]);

  const user = userRaw ? safeJsonParse(userRaw) : null;
  return { accessToken, refreshToken, user };
}

export async function storeAuth({ accessToken, refreshToken, user }) {
  const ops = [
    AsyncStorage.setItem(STORAGE_KEYS.accessToken, accessToken || ''),
    AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user || null)),
  ];
  if (refreshToken) ops.push(AsyncStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken));
  await Promise.all(ops);
}

export async function clearAuth() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.accessToken),
    AsyncStorage.removeItem(STORAGE_KEYS.refreshToken),
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

