/**
 * Migration: Create Therapies and TherapyUsage tables
 * Date: 2026-01-16
 * Description: Creates tables for therapy management and therapy usage tracking
 */

export async function up(queryInterface, Sequelize) {
  // Create therapies table
  await queryInterface.createTable('therapies', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: 'Terapiya nomi',
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Terapiya tavsifi',
    },
    therapyType: {
      type: Sequelize.ENUM('music', 'video', 'content', 'art', 'physical', 'speech', 'occupational', 'other'),
      allowNull: false,
      comment: 'Terapiya turi',
    },
    contentUrl: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Musiqa, video yoki content URL',
    },
    contentType: {
      type: Sequelize.ENUM('audio', 'video', 'image', 'document', 'interactive', 'link'),
      allowNull: true,
      comment: 'Content turi',
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Davomiyligi (daqiqalarda)',
    },
    ageGroup: {
      type: Sequelize.ENUM('infant', 'toddler', 'preschool', 'school_age', 'adolescent', 'all'),
      defaultValue: 'all',
      allowNull: false,
      comment: 'Yosh guruhi',
    },
    difficultyLevel: {
      type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'all'),
      defaultValue: 'all',
      allowNull: false,
      comment: 'Qiyinlik darajasi',
    },
    tags: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Teglar',
    },
    createdBy: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Yaratgan foydalanuvchi',
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    usageCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Foydalanish soni',
    },
    rating: {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'O\'rtacha reyting',
    },
    ratingCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Reytinglar soni',
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

  // Create indexes for therapies table
  try {
    await queryInterface.addIndex('therapies', {
      fields: ['therapyType'],
      name: 'idx_therapies_therapy_type',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapies', {
      fields: ['ageGroup'],
      name: 'idx_therapies_age_group',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapies', {
      fields: ['difficultyLevel'],
      name: 'idx_therapies_difficulty_level',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapies', {
      fields: ['isActive'],
      name: 'idx_therapies_is_active',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapies', {
      fields: ['createdBy'],
      name: 'idx_therapies_created_by',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  // Create therapy_usages table
  await queryInterface.createTable('therapy_usages', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    therapyId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'therapies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'children',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    parentId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    teacherId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
      comment: 'Boshlanish vaqti',
    },
    endTime: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Tugash vaqti',
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Davomiyligi (daqiqalarda)',
    },
    progress: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Taraqqiyot foizi',
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedback: {
      type: Sequelize.TEXT,
      allowNull: true,
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

  // Create indexes for therapy_usages table
  try {
    await queryInterface.addIndex('therapy_usages', {
      fields: ['therapyId'],
      name: 'idx_therapy_usages_therapy_id',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapy_usages', {
      fields: ['childId'],
      name: 'idx_therapy_usages_child_id',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapy_usages', {
      fields: ['parentId'],
      name: 'idx_therapy_usages_parent_id',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapy_usages', {
      fields: ['teacherId'],
      name: 'idx_therapy_usages_teacher_id',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('therapy_usages', {
      fields: ['startTime'],
      name: 'idx_therapy_usages_start_time',
      ifNotExists: true,
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('therapy_usages');
  await queryInterface.dropTable('therapies');
}
