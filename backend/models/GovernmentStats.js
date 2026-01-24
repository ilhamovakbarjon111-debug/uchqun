import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GovernmentStats = sequelize.define('GovernmentStats', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  region: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Viloyat yoki shahar',
  },
  district: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Tuman',
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'schools',
      key: 'id',
    },
    comment: 'Maktab ID (agar mavjud bo\'lsa)',
  },
  statType: {
    type: DataTypes.ENUM('overview', 'schools', 'students', 'teachers', 'ratings', 'payments', 'therapies', 'activities', 'complaints'),
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
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Yaratgan foydalanuvchi',
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Yaratilgan vaqti',
  },
}, {
  tableName: 'government_stats',
  timestamps: true,
  indexes: [
    { fields: ['region'] },
    { fields: ['district'] },
    { fields: ['schoolId'] },
    { fields: ['statType'] },
    { fields: ['period'] },
    { fields: ['periodStart', 'periodEnd'] },
  ],
});

export default GovernmentStats;
