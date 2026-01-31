/**
 * Migration: Update to Role-Based Architecture
 * 
 * Changes:
 * 1. Update User role enum: 'admin' (formerly Super Admin), 'reception' (formerly Admin), 'teacher', 'parent'
 * 2. Add User fields: isVerified, documentsApproved, isActive
 * 3. Create Document table for Reception document uploads
 * 4. Create Parent-specific tables: ParentActivity, ParentMeal, ParentMedia
 * 5. Create Teacher-specific tables: TeacherResponsibility, TeacherTask, TeacherWorkHistory
 */

export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  // Step 1: Update User role enum to include 'reception'
  // Note: In PostgreSQL, we need to alter the enum type
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      -- Check if enum needs to be updated
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_users_role_new'
      ) THEN
        -- Create new enum with all roles
        CREATE TYPE "enum_users_role_new" AS ENUM ('admin', 'reception', 'teacher', 'parent');
        
        -- Drop default to avoid casting issues during enum change
        ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

        -- Alter users table to use new enum
        ALTER TABLE "users" 
          ALTER COLUMN "role" TYPE "enum_users_role_new" 
          USING CASE 
            WHEN "role"::text = 'admin' THEN 'admin'::enum_users_role_new
            WHEN "role"::text = 'teacher' THEN 'teacher'::enum_users_role_new
            WHEN "role"::text = 'parent' THEN 'parent'::enum_users_role_new
            ELSE 'parent'::enum_users_role_new
          END;
        
        -- Drop old enum and rename new one
        DROP TYPE IF EXISTS "enum_users_role";
        ALTER TYPE "enum_users_role_new" RENAME TO "enum_users_role";

        -- Restore default
        ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'parent'::"enum_users_role";
      END IF;
    END $$;
  `);

  // Step 2: Add new fields to users table
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      -- Add isVerified column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'isVerified'
      ) THEN
        ALTER TABLE "users" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
      END IF;
      
      -- Add documentsApproved column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'documentsApproved'
      ) THEN
        ALTER TABLE "users" ADD COLUMN "documentsApproved" BOOLEAN NOT NULL DEFAULT false;
      END IF;
      
      -- Add isActive column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'isActive'
      ) THEN
        ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;
      END IF;
      
      -- Set isActive to true for existing users (except reception)
      UPDATE "users" SET "isActive" = true WHERE "role" != 'reception';
    END $$;
  `);

  // Step 3: Create Document table
  await queryInterface.createTable('documents', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    documentType: {
      type: DataTypes.ENUM('license', 'certificate', 'identification', 'other'),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 4: Create ParentActivity table
  await queryInterface.createTable('parent_activities', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activityDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    activityType: {
      type: DataTypes.ENUM('educational', 'recreational', 'therapeutic', 'social', 'other'),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 5: Create ParentMeal table
  await queryInterface.createTable('parent_meals', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    mealDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    mealType: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
      allowNull: false,
    },
    mealName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 6: Create ParentMedia table
  await queryInterface.createTable('parent_media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM('image', 'video', 'document', 'audio'),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 7: Create TeacherResponsibility table
  await queryInterface.createTable('teacher_responsibilities', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active',
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 8: Create TeacherTask table
  await queryInterface.createTable('teacher_tasks', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taskDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 9: Create TeacherWorkHistory table
  await queryInterface.createTable('teacher_work_history', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    workDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    workType: {
      type: DataTypes.ENUM('assignment', 'report', 'meeting', 'training', 'evaluation', 'other'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Step 10: Create indexes for better performance
  await queryInterface.addIndex('documents', ['userId']);
  await queryInterface.addIndex('documents', ['status']);
  await queryInterface.addIndex('parent_activities', ['parentId']);
  await queryInterface.addIndex('parent_activities', ['activityDate']);
  await queryInterface.addIndex('parent_meals', ['parentId']);
  await queryInterface.addIndex('parent_meals', ['mealDate']);
  await queryInterface.addIndex('parent_media', ['parentId']);
  await queryInterface.addIndex('teacher_responsibilities', ['teacherId']);
  await queryInterface.addIndex('teacher_tasks', ['teacherId']);
  await queryInterface.addIndex('teacher_work_history', ['teacherId']);
  await queryInterface.addIndex('teacher_work_history', ['deadline']);
};

export const down = async (queryInterface, Sequelize) => {
  // Drop tables in reverse order
  await queryInterface.dropTable('teacher_work_history');
  await queryInterface.dropTable('teacher_tasks');
  await queryInterface.dropTable('teacher_responsibilities');
  await queryInterface.dropTable('parent_media');
  await queryInterface.dropTable('parent_meals');
  await queryInterface.dropTable('parent_activities');
  await queryInterface.dropTable('documents');

  // Remove columns from users table
  await queryInterface.removeColumn('users', 'isVerified');
  await queryInterface.removeColumn('users', 'documentsApproved');
  await queryInterface.removeColumn('users', 'isActive');

  // Note: Reverting enum changes is complex in PostgreSQL, so we'll leave it
  // The enum will still have the new values, but that's acceptable
};



