export async function up(queryInterface, Sequelize) {
  // Add evaluation field to school_ratings table if it doesn't exist
  try {
    // Check if column already exists
    const columnExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'school_ratings'
        AND column_name = 'evaluation'
      );
    `);
    
    if (columnExists[0][0].exists) {
      console.log('ℹ evaluation column already exists, skipping');
      return;
    }
    
    await queryInterface.addColumn('school_ratings', 'evaluation', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
    });
    
    console.log('✓ Added evaluation column to school_ratings table');
  } catch (error) {
    // Column might already exist, ignore error
    if (!error.message.includes('already exists') && !error.message.includes('duplicate column')) {
      console.warn('Could not add evaluation column:', error.message);
      throw error;
    } else {
      console.log('ℹ evaluation column already exists, skipping');
    }
  }
}

export async function down(queryInterface) {
  // Remove evaluation field from school_ratings table
  try {
    await queryInterface.removeColumn('school_ratings', 'evaluation');
    console.log('✓ Removed evaluation column from school_ratings table');
  } catch (error) {
    // Column might not exist, ignore error
    if (!error.message.includes('does not exist')) {
      console.warn('Could not remove evaluation column:', error.message);
      throw error;
    } else {
      console.log('ℹ evaluation column does not exist, skipping');
    }
  }
}
