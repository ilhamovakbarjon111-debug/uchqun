import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  senderRole: {
    type: DataTypes.ENUM('parent', 'teacher'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  readByParent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readByTeacher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'chat_messages',
  timestamps: true,
});

export default ChatMessage;

