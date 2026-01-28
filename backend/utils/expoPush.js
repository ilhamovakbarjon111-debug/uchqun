/**
 * Send push notifications via Expo Push API
 * https://docs.expo.dev/push-notifications/sending-notifications/
 */
import PushNotification from '../models/PushNotification.js';
import logger from './logger.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Get unique device tokens for a user (registration rows only: notificationType === 'system')
 */
export async function getDeviceTokensForUser(userId) {
  const rows = await PushNotification.findAll({
    where: {
      userId,
      notificationType: 'system',
    },
    attributes: ['deviceToken'],
  });
  const tokens = [...new Set(rows.map((r) => r.deviceToken).filter(Boolean))];
  return tokens;
}

/**
 * Send messages to Expo Push API
 * @param {Array<{ to: string, title: string, body: string, data?: object }>} messages
 */
export async function sendToExpo(messages) {
  if (!messages.length) return { success: 0, failed: 0 };
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        messages.map((m) => ({
          to: m.to,
          title: m.title,
          body: m.body,
          data: m.data || {},
          sound: 'default',
          priority: m.priority || 'default',
        }))
      ),
    });
    const data = await response.json();
    if (data.data) {
      const success = data.data.filter((r) => r.status === 'ok').length;
      const failed = data.data.filter((r) => r.status === 'error').length;
      if (failed > 0) {
        data.data.filter((r) => r.status === 'error').forEach((r) => {
          logger.warn('Expo push error', { message: r.message, details: r.details });
        });
      }
      return { success, failed, receipts: data.data };
    }
    return { success: 0, failed: messages.length };
  } catch (err) {
    logger.error('Expo push request error', { error: err.message });
    return { success: 0, failed: messages.length };
  }
}

/**
 * Send push notification to a user (teacher or parent).
 * Called when new activity, meal, media, or chat message is created.
 */
export async function sendPushToUser(userId, title, body, data = {}, notificationType = 'other') {
  if (!userId) return;
  try {
    const tokens = await getDeviceTokensForUser(userId);
    if (tokens.length === 0) {
      logger.debug('No device tokens for user', { userId });
      return;
    }
    const messages = tokens.map((to) => ({
      to,
      title,
      body,
      data: { ...data, type: notificationType },
    }));
    const result = await sendToExpo(messages);
    logger.info('Push sent to user', { userId, notificationType, success: result.success, failed: result.failed });
  } catch (err) {
    logger.error('sendPushToUser error', { userId, error: err.message });
  }
}
