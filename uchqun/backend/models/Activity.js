import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Child from './Child.js';

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  childId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'children',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Learning', 'Therapy', 'Social', 'Physical', 'Other'),
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  teacher: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  studentEngagement: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Individual Plan fields
  skill: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ko\'nikma (Skill)',
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Maqsad (Goal)',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Vazifalar tuzilgan sana',
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Maqsadlarga erishish muddati',
  },
  tasks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Vazifalar ro\'yxati (array)',
  },
  methods: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Usullar (Methods)',
  },
  progress: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Jarayon/Taraqqiyot (Progress)',
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kuzatish (Observation)',
  },
  services: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Tanlangan xizmatlar ro\'yxati (array)',
  },
}, {
  tableName: 'activities',
  timestamps: true,
  indexes: [
    {
      fields: ['childId', 'date'],
    },
  ],
});

// Define associations
Activity.belongsTo(Child, { foreignKey: 'childId', as: 'child' });
Child.hasMany(Activity, { foreignKey: 'childId', as: 'activities' });

export default Activity;

