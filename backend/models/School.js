import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const School = sequelize.define('School', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Maktab yoki bog\'cha nomi',
  },
  type: {
    type: DataTypes.ENUM('school', 'kindergarten', 'both'),
    defaultValue: 'both',
    allowNull: false,
    comment: 'Maktab, bog\'cha yoki ikkalasi',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  tableName: 'schools',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['type'] },
    { fields: ['isActive'] },
  ],
});

export default School;
