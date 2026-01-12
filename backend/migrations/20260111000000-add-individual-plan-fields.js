/**
 * Migration: Add Individual Plan fields to Activities table
 * 
 * Adds fields for structured individual plan:
 * - skill (ko'nikma)
 * - goal (maqsad)
 * - startDate (vazifalar tuzilgan sana)
 * - endDate (maqsadlarga erishish muddati)
 * - tasks (vazifalar - JSONB array)
 * - methods (usullar)
 * - progress (jarayon/taraqqiyot)
 * - observation (kuzatish)
 */

export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  // Add new columns to activities table
  await queryInterface.addColumn('activities', 'skill', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ko\'nikma (Skill)',
  });

  await queryInterface.addColumn('activities', 'goal', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Maqsad (Goal)',
  });

  await queryInterface.addColumn('activities', 'startDate', {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Vazifalar tuzilgan sana',
  });

  await queryInterface.addColumn('activities', 'endDate', {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Maqsadlarga erishish muddati',
  });

  // For PostgreSQL, use JSONB for tasks array
  await queryInterface.sequelize.query(`
    ALTER TABLE "activities" 
    ADD COLUMN IF NOT EXISTS "tasks" JSONB DEFAULT '[]'::jsonb;
  `);

  await queryInterface.addColumn('activities', 'methods', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Usullar (Methods)',
  });

  await queryInterface.addColumn('activities', 'progress', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Jarayon/Taraqqiyot (Progress)',
  });

  await queryInterface.addColumn('activities', 'observation', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kuzatish (Observation)',
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove columns in reverse order
  await queryInterface.removeColumn('activities', 'observation');
  await queryInterface.removeColumn('activities', 'progress');
  await queryInterface.removeColumn('activities', 'methods');
  await queryInterface.removeColumn('activities', 'tasks');
  await queryInterface.removeColumn('activities', 'endDate');
  await queryInterface.removeColumn('activities', 'startDate');
  await queryInterface.removeColumn('activities', 'goal');
  await queryInterface.removeColumn('activities', 'skill');
};
