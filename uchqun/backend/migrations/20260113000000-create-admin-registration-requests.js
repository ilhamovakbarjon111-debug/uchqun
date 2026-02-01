export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('admin_registration_requests', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    certificateFile: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    passportFile: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    passportNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    passportSeries: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    region: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    reviewedBy: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    reviewedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    approvedUserId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });

  // Add indexes
  try {
    await queryInterface.addIndex('admin_registration_requests', ['email'], {
      name: 'admin_registration_requests_email',
      ifNotExists: true,
      unique: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
  
  try {
    await queryInterface.addIndex('admin_registration_requests', ['status'], {
      name: 'admin_registration_requests_status',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
  
  try {
    await queryInterface.addIndex('admin_registration_requests', ['reviewedBy'], {
      name: 'admin_registration_requests_reviewed_by',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
  
  try {
    await queryInterface.addIndex('admin_registration_requests', ['createdAt'], {
      name: 'admin_registration_requests_created_at',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('admin_registration_requests');
}
