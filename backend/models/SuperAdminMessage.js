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
  },
  subject: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
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
