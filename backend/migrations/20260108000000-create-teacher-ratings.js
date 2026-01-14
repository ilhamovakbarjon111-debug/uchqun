export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('teacher_ratings', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    },
    teacherId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    parentId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    stars: {
      type: Sequelize.INTEGER,
      allowNull: false,
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

  // Add index if it doesn't exist
  try {
    await queryInterface.addIndex('teacher_ratings', ['teacherId'], {
      name: 'teacher_ratings_teacher_id',
      ifNotExists: true
    });
  } catch (error) {
    // Index might already exist, ignore error
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
  
  // Add constraint if it doesn't exist
  try {
    await queryInterface.addConstraint('teacher_ratings', {
      fields: ['teacherId', 'parentId'],
      type: 'unique',
      name: 'teacher_ratings_teacher_parent_unique',
    });
  } catch (error) {
    // Constraint might already exist, ignore error
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

export async function down(queryInterface) {
  await queryInterface.dropTable('teacher_ratings');
}

