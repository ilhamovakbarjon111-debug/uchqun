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

  // Helper function to safely add column if it doesn't exist
  const addColumnIfNotExists = async (tableName, columnName, columnDefinition) => {
    const tableDescription = await queryInterface.describeTable(tableName);
    if (!tableDescription[columnName]) {
      await queryInterface.addColumn(tableName, columnName, columnDefinition);
      console.log(`✓ Added column ${columnName} to ${tableName}`);
    } else {
      console.log(`⏭ Column ${columnName} already exists in ${tableName}, skipping`);
    }
  };

  // Add new columns to activities table (safely)
  await addColumnIfNotExists('activities', 'skill', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  await addColumnIfNotExists('activities', 'goal', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await addColumnIfNotExists('activities', 'startDate', {
    type: DataTypes.DATEONLY,
    allowNull: true,
  });

  await addColumnIfNotExists('activities', 'endDate', {
    type: DataTypes.DATEONLY,
    allowNull: true,
  });

  // For PostgreSQL, use JSONB for tasks array
  await queryInterface.sequelize.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'tasks'
      ) THEN
        ALTER TABLE "activities" ADD COLUMN "tasks" JSONB DEFAULT '[]'::jsonb;
      END IF;
    END $$;
  `);

  await addColumnIfNotExists('activities', 'methods', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await addColumnIfNotExists('activities', 'progress', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await addColumnIfNotExists('activities', 'observation', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  // For PostgreSQL, use JSONB for services array
  await queryInterface.sequelize.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'services'
      ) THEN
        ALTER TABLE "activities" ADD COLUMN "services" JSONB DEFAULT '[]'::jsonb;
      END IF;
    END $$;
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // Remove columns in reverse order
  await queryInterface.removeColumn('activities', 'services');
  await queryInterface.removeColumn('activities', 'observation');
  await queryInterface.removeColumn('activities', 'progress');
  await queryInterface.removeColumn('activities', 'methods');
  await queryInterface.removeColumn('activities', 'tasks');
  await queryInterface.removeColumn('activities', 'endDate');
  await queryInterface.removeColumn('activities', 'startDate');
  await queryInterface.removeColumn('activities', 'goal');
  await queryInterface.removeColumn('activities', 'skill');
};
