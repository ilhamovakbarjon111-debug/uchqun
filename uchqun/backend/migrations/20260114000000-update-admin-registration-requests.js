export async function up(queryInterface, Sequelize) {
  // Update admin_registration_requests table to make passportNumber and location optional
  // and add certificateFile and passportFile fields
  
  // Make passportNumber nullable
  await queryInterface.changeColumn('admin_registration_requests', 'passportNumber', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  
  // Make location nullable
  await queryInterface.changeColumn('admin_registration_requests', 'location', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  
  // Make phone required (not nullable)
  await queryInterface.changeColumn('admin_registration_requests', 'phone', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  
  // Add certificateFile column if it doesn't exist
  try {
    await queryInterface.addColumn('admin_registration_requests', 'certificateFile', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      throw error;
    }
  }
  
  // Add passportFile column if it doesn't exist
  try {
    await queryInterface.addColumn('admin_registration_requests', 'passportFile', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      throw error;
    }
  }
}

export async function down(queryInterface, Sequelize) {
  // Revert changes
  await queryInterface.changeColumn('admin_registration_requests', 'passportNumber', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  
  await queryInterface.changeColumn('admin_registration_requests', 'location', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  
  await queryInterface.changeColumn('admin_registration_requests', 'phone', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  
  try {
    await queryInterface.removeColumn('admin_registration_requests', 'certificateFile');
  } catch (error) {
    // Ignore if column doesn't exist
  }
  
  try {
    await queryInterface.removeColumn('admin_registration_requests', 'passportFile');
  } catch (error) {
    // Ignore if column doesn't exist
  }
}
