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
    comment: 'Foydalanuvchi qurilma tokeni',
  },
  platform: {
    type: DataTypes.ENUM('ios', 'android', 'web'),
    allowNull: false,
    comment: 'Platforma',
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Xabarnoma sarlavhasi',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Xabarnoma matni',
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Qo\'shimcha ma\'lumotlar',
  },
  notificationType: {
    type: DataTypes.ENUM('activity', 'meal', 'media', 'rating', 'warning', 'message', 'system', 'payment', 'therapy', 'other'),
    allowNull: false,
    comment: 'Xabarnoma turi',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high'),
    defaultValue: 'normal',
    allowNull: false,
    comment: 'Xabarnoma ustuvorligi',
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'opened'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Xabarnoma holati',
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Yuborilgan vaqti',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Yetkazilgan vaqti',
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ochilgan vaqti',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Xato xabari (agar mavjud bo\'lsa)',
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Qayta urinishlar soni',
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
