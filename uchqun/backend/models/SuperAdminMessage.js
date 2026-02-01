import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SuperAdminMessage = sequelize.define('SuperAdminMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who sent the message (parent, teacher, admin, reception)',
  },
  subject: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Message subject',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Message content',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether super-admin has read this message',
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When super-admin read the message',
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Super-admin reply to the message',
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When super-admin replied',
  },
}, {
  tableName: 'super_admin_messages',
  timestamps: true,
  indexes: [
    { fields: ['senderId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
  ],
});

export default SuperAdminMessage;
