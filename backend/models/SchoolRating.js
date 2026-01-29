import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchoolRating = sequelize.define('SchoolRating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'schools',
      key: 'id',
    },
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  stars: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: {
        args: [1],
        msg: 'Stars must be at least 1',
      },
      max: {
        args: [5],
        msg: 'Stars must be at most 5',
      },
      // Allow null values
      isNullOrValid(value) {
        if (value === null || value === undefined) {
          return true;
        }
        const num = Number(value);
        return !isNaN(num) && num >= 1 && num <= 5;
      },
    },
  },
  evaluation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'school_ratings',
  timestamps: true,
  indexes: [
    { fields: ['schoolId'] },
    { unique: true, fields: ['schoolId', 'parentId'] },
  ],
});

export default SchoolRating;
