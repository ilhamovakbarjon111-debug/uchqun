export const up = async (queryInterface, Sequelize) => {
  // Create ENUM types
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_users_role" AS ENUM ('parent', 'teacher', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_children_gender" AS ENUM ('Male', 'Female', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_activities_type" AS ENUM ('Learning', 'Therapy', 'Social', 'Physical', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_activities_studentEngagement" AS ENUM ('High', 'Medium', 'Low');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_meals_mealType" AS ENUM ('Breakfast', 'Lunch', 'Snack', 'Dinner');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_media_type" AS ENUM ('photo', 'video');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create users table
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
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
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    role: {
      type: Sequelize.ENUM('parent', 'teacher', 'admin'),
      defaultValue: 'parent',
      allowNull: false,
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    notificationPreferences: {
      type: Sequelize.JSONB,
      defaultValue: { email: true, push: true },
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

  // Create index on email
  await queryInterface.addIndex('users', ['email'], {
    unique: true,
    name: 'users_email_unique',
  });

  // Create children table
  await queryInterface.createTable('children', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: Sequelize.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
    },
    disabilityType: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    specialNeeds: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    photo: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    school: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    class: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    teacher: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    emergencyContact: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
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

  // Create index on parentId for children
  await queryInterface.addIndex('children', ['parentId'], {
    name: 'children_parentId_idx',
  });

  // Create activities table
  await queryInterface.createTable('activities', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'children',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE'),
    },
    title: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('Learning', 'Therapy', 'Social', 'Physical', 'Other'),
      allowNull: false,
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    teacher: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    studentEngagement: {
      type: Sequelize.ENUM('High', 'Medium', 'Low'),
      defaultValue: 'Medium',
      allowNull: true,
    },
    notes: {
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

  // Create index on childId and date for activities
  await queryInterface.addIndex('activities', ['childId', 'date'], {
    name: 'activities_childId_date_idx',
  });

  // Create meals table
  await queryInterface.createTable('meals', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'children',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE'),
    },
    mealType: {
      type: Sequelize.ENUM('Breakfast', 'Lunch', 'Snack', 'Dinner'),
      allowNull: false,
    },
    mealName: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    quantity: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    specialNotes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    time: {
      type: Sequelize.TIME,
      allowNull: true,
    },
    eaten: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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

  // Create index on childId and date for meals
  await queryInterface.addIndex('meals', ['childId', 'date'], {
    name: 'meals_childId_date_idx',
  });

  // Create media table
  await queryInterface.createTable('media', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'children',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    activityId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'activities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    type: {
      type: Sequelize.ENUM('photo', 'video'),
      allowNull: false,
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE'),
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

  // Create indexes for media
  await queryInterface.addIndex('media', ['childId', 'date'], {
    name: 'media_childId_date_idx',
  });
  await queryInterface.addIndex('media', ['type'], {
    name: 'media_type_idx',
  });

  // Create progress table
  await queryInterface.createTable('progress', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'children',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    academic: {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    social: {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    behavioral: {
      type: Sequelize.JSONB,
      defaultValue: {},
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

  // Create unique index on childId for progress
  await queryInterface.addIndex('progress', ['childId'], {
    unique: true,
    name: 'progress_childId_unique',
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Drop tables in reverse order
  await queryInterface.dropTable('progress');
  await queryInterface.dropTable('media');
  await queryInterface.dropTable('meals');
  await queryInterface.dropTable('activities');
  await queryInterface.dropTable('children');
  await queryInterface.dropTable('users');

  // Drop ENUM types
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_children_gender"');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activities_type"');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_activities_studentEngagement"');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_meals_mealType"');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_media_type"');
};



