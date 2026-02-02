import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PushNotification = sequelize.define('PushNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  deviceToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  platform: {
    type: DataTypes.ENUM('ios', 'android', 'web'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  notificationType: {
    type: DataTypes.ENUM('activity', 'meal', 'media', 'rating', 'warning', 'message', 'system', 'payment', 'therapy', 'other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high'),
    defaultValue: 'normal',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'opened'),
    defaultValue: 'pending',
    allowNull: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'push_notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['deviceToken'] },
    { fields: ['status'] },
    { fields: ['notificationType'] },
    { fields: ['sentAt'] },
  ],
});

export default PushNotification;
