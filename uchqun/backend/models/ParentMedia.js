import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * ParentMedia Model
 * Stores media files specific to individual parents
 * 
 * Business Logic:
 * - Media files are linked to specific parent users
 * - Parents can only view their own media
 * - When viewing parent list, clicking on a parent shows their media
 */
const ParentMedia = sequelize.define('ParentMedia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Parent user this media belongs to',
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.ENUM('image', 'video', 'document', 'audio'),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  uploadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'parent_media',
  timestamps: true,
});

export default ParentMedia;



