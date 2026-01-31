/**
 * Quick script to add missing columns to users table
 * Run this if migration didn't work: node scripts/add-user-columns.js
 */

import sequelize from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addColumns() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Check and add columns if they don't exist
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('isVerified', 'documentsApproved', 'isActive')
    `);

    const existingColumns = columns.map(c => c.column_name);

    if (!existingColumns.includes('isVerified')) {
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;`);
      console.log('✓ Added isVerified column');
    } else {
      console.log('⏭ isVerified column already exists');
    }

    if (!existingColumns.includes('documentsApproved')) {
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "documentsApproved" BOOLEAN NOT NULL DEFAULT false;`);
      console.log('✓ Added documentsApproved column');
    } else {
      console.log('⏭ documentsApproved column already exists');
    }

    if (!existingColumns.includes('isActive')) {
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;`);
      console.log('✓ Added isActive column');
    } else {
      console.log('⏭ isActive column already exists');
    }

    // Set isActive to true for existing users (except reception)
    await sequelize.query(`UPDATE "users" SET "isActive" = true WHERE ("role" != 'reception' OR "role" IS NULL);`);
    console.log('✓ Updated isActive for existing users');

    // Update role enum if needed
    const [enumCheck] = await sequelize.query(`
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'reception' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_users_role')
    `);

    if (enumCheck.length === 0) {
      console.log('🔄 Updating role enum to include reception...');
      await sequelize.query(`
        DO $$ BEGIN
          -- Create new enum with all roles
          CREATE TYPE "enum_users_role_new" AS ENUM ('admin', 'reception', 'teacher', 'parent');
          
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
        END $$;
      `);
      console.log('✓ Updated role enum to include reception');
    } else {
      console.log('⏭ Role enum already includes reception');
    }

    console.log('✓ All columns added successfully');
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

addColumns();

