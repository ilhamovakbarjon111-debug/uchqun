export async function up(queryInterface, Sequelize) {
  // Create school_ratings table if it doesn't exist
  try {
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'school_ratings'
      );
    `);
    
    if (tableExists[0][0].exists) {
      console.log('ℹ school_ratings table already exists, skipping');
      return;
    }
    
    await queryInterface.createTable('school_ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      schoolId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'schools',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stars: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      numericRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      evaluation: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: Sequelize.literal("'{}'::jsonb"),
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('school_ratings', ['schoolId'], {
      name: 'school_ratings_school_id',
      ifNotExists: true,
    });

    // Add unique constraint
    await queryInterface.addConstraint('school_ratings', {
      fields: ['schoolId', 'parentId'],
      type: 'unique',
      name: 'school_ratings_school_parent_unique',
    });

    console.log('✓ Created school_ratings table');
  } catch (error) {
    // Table might already exist, ignore error
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      console.warn('Could not create school_ratings table:', error.message);
      throw error;
    } else {
      console.log('ℹ school_ratings table already exists, skipping');
    }
  }
}

export async function down(queryInterface) {
  // Remove school_ratings table
  try {
    await queryInterface.dropTable('school_ratings');
    console.log('✓ Dropped school_ratings table');
  } catch (error) {
    // Table might not exist, ignore error
    if (!error.message.includes('does not exist')) {
      console.warn('Could not drop school_ratings table:', error.message);
      throw error;
    } else {
      console.log('ℹ school_ratings table does not exist, skipping');
    }
  }
}
