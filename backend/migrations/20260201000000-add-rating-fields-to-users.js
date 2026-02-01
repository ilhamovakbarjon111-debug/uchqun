export async function up(queryInterface, Sequelize) {
  // Add rating field to users table if it doesn't exist
  try {
    await queryInterface.addColumn('users', 'rating', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });
  } catch (error) {
    // Column might already exist, ignore error
    if (!error.message.includes('already exists')) {
      console.warn('Could not add rating column:', error.message);
    }
  }

  // Add totalRatings field to users table if it doesn't exist
  try {
    await queryInterface.addColumn('users', 'totalRatings', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  } catch (error) {
    // Column might already exist, ignore error
    if (!error.message.includes('already exists')) {
      console.warn('Could not add totalRatings column:', error.message);
    }
  }
}

export async function down(queryInterface) {
  // Remove rating field from users table
  try {
    await queryInterface.removeColumn('users', 'rating');
  } catch (error) {
    console.warn('Could not remove rating column:', error.message);
  }

  // Remove totalRatings field from users table
  try {
    await queryInterface.removeColumn('users', 'totalRatings');
  } catch (error) {
    console.warn('Could not remove totalRatings column:', error.message);
  }
}
