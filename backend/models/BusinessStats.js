import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BusinessStats = sequelize.define('BusinessStats', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Tadbirkor ID',
  },
  statType: {
    type: DataTypes.ENUM('overview', 'users', 'schools', 'revenue', 'subscriptions', 'usage', 'engagement', 'custom'),
    allowNull: false,
    comment: 'Statistika turi',
  },
  period: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
    comment: 'Davr',
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Davr boshlanishi',
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Davr tugashi',
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Statistika ma\'lumotlari',
  },
  summary: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Umumiy xulosa',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Ommaviy statistika',
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Yaratilgan vaqti',
  },
}, {
  tableName: 'business_stats',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['statType'] },
    { fields: ['period'] },
    { fields: ['periodStart', 'periodEnd'] },
    { fields: ['isPublic'] },
  ],
});

export default BusinessStats;
