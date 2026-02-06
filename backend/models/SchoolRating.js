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
    allowNull: true, // Allow null in database for backward compatibility, but validate in controller
    validate: {
      // Custom validator for valid integer between 1-5 (only when value is provided)
      isValidStars(value) {
        // Allow null/undefined for backward compatibility with existing records
        if (value === null || value === undefined) {
          return true;
        }
        const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num)) {
          throw new Error('Stars must be an integer');
        }
        if (num < 1 || num > 5) {
          throw new Error('Stars must be between 1 and 5');
        }
        return true;
      },
    },
  },
  numericRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      // Custom validator that allows null/undefined or valid integer between 1-10
      isValidNumericRating(value) {
        if (value === null || value === undefined) {
          return true; // Allow null/undefined
        }
        const num = Number(value);
        if (isNaN(num) || !Number.isInteger(num)) {
          throw new Error('Numeric rating must be an integer');
        }
        if (num < 1 || num > 10) {
          throw new Error('Numeric rating must be between 1 and 10');
        }
        return true;
      },
    },
  },
  evaluation: {
    type: DataTypes.JSONB,
    allowNull: true,
    // Don't set defaultValue here - let database default handle it
    // Note: This field may not exist in older database schemas
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
