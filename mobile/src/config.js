export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://uchqun-production-4f83.up.railway.app/api';

// IMPORTANT:
// - Android Emulator: host machine -> http://10.0.2.2:<port>
// - Real device: use your PC's LAN IP (e.g. http://192.168.x.x:<port>) or a deployed URL (Railway/Vercel/etc.)
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://uchqun-one.vercel.app';

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
};

export function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '');
  if (!p) return b;
  if (p.startsWith('/')) return `${b}${p}`;
  return `${b}/${p}`;
}

