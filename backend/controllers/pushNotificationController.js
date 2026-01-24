import PushNotification from '../models/PushNotification.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

// TODO: Integrate with FCM (Firebase Cloud Messaging) or Expo Push Notifications
// For now, this is a placeholder implementation

/**
 * Register device token
 * POST /api/push-notifications/register
 */
export const registerDevice = async (req, res) => {
  try {
    const { deviceToken, platform } = req.body;
    const userId = req.user.id;

    if (!deviceToken || !platform) {
      return res.status(400).json({ error: 'Device token and platform are required' });
    }

    // Check if device already registered
    let device = await PushNotification.findOne({
      where: {
        userId,
        deviceToken,
      },
    });

    if (device) {
      await device.update({
        platform,
        status: 'pending',
      });
    } else {
      device = await PushNotification.create({
        userId,
        deviceToken,
        platform,
        title: 'Device registered',
        body: 'Your device has been registered for push notifications',
        notificationType: 'system',
        status: 'pending',
      });
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    logger.error('Register device error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to register device' });
  }
};

/**
 * Send push notification
 * POST /api/push-notifications/send
 */
export const sendNotification = async (req, res) => {
  try {
    const {
      userId,
      title,
      body,
      data,
      notificationType,
      priority = 'normal',
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Get user's device tokens
    const devices = await PushNotification.findAll({
      where: {
        userId: userId || req.user.id,
        status: { [Op.in]: ['pending', 'sent', 'delivered'] },
      },
    });

    if (devices.length === 0) {
      return res.json({
        success: true,
        message: 'No devices found for user',
        sent: 0,
      });
    }

    const notifications = [];
    for (const device of devices) {
      const notification = await PushNotification.create({
        userId: device.userId,
        deviceToken: device.deviceToken,
        platform: device.platform,
        title,
        body,
        data,
        notificationType: notificationType || 'other',
        priority,
        status: 'pending',
      });

      // TODO: Send actual push notification via FCM/Expo
      // For now, mark as sent
      await notification.update({
        status: 'sent',
        sentAt: new Date(),
      });

      notifications.push(notification);
    }

    res.json({
      success: true,
      data: {
        notifications,
        sent: notifications.length,
      },
    });
  } catch (error) {
    logger.error('Send notification error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

/**
 * Get user notifications
 * GET /api/push-notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const {
      status,
      notificationType,
      limit = 20,
      offset = 0,
    } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (notificationType) {
      where.notificationType = notificationType;
    }

    const notifications = await PushNotification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        total: notifications.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get notifications error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as opened
 * PUT /api/push-notifications/:id/open
 */
export const markAsOpened = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await PushNotification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await notification.update({
      status: 'opened',
      openedAt: new Date(),
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Mark as opened error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to mark notification as opened' });
  }
};

/**
 * Unregister device
 * DELETE /api/push-notifications/device/:token
 */
export const unregisterDevice = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const device = await PushNotification.findOne({
      where: {
        userId,
        deviceToken: token,
      },
    });

    if (device) {
      await device.destroy();
    }

    res.json({
      success: true,
      message: 'Device unregistered',
    });
  } catch (error) {
    logger.error('Unregister device error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to unregister device' });
  }
};
