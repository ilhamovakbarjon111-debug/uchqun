import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * ParentActivity Model
 * Stores activities specific to individual parents
 * 
 * Business Logic:
 * - Activities are linked to specific parent users
 * - Parents can only view their own activities
 * - When viewing parent list, clicking on a parent shows their activities
 */
const ParentActivity = sequelize.define('ParentActivity', {
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
    comment: 'Parent user this activity belongs to',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  activityDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  activityType: {
    type: DataTypes.ENUM('educational', 'recreational', 'therapeutic', 'social', 'other'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'parent_activities',
  timestamps: true,
});

export default ParentActivity;



