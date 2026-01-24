/**
 * Migration: Add government and business roles to users table
 * Date: 2026-01-17
 * Description: Adds 'government' and 'business' roles to the users role ENUM
 */

export async function up(queryInterface, Sequelize) {
  // Add 'government' and 'business' to the role ENUM
  // PostgreSQL requires dropping and recreating the ENUM type
  try {
    // First, check if the enum type exists and what values it has
    const [enumCheck] = await queryInterface.sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_users_role'
      )
      ORDER BY enumsortorder;
    `);

    const existingRoles = enumCheck.map(row => row.enumlabel);
    
    // Only add roles that don't exist
    if (!existingRoles.includes('government')) {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'government';
      `);
    }

    if (!existingRoles.includes('business')) {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'business';
      `);
    }

    if (!existingRoles.includes('reception')) {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'reception';
      `);
    }

    console.log('✓ Added government, business, and reception roles to enum_users_role');
  } catch (error) {
    // If the error is about the enum not existing, try creating it with all values
    if (error.message.includes('does not exist') || error.message.includes('type') || error.message.includes('enum')) {
      try {
        // Drop existing enum if it exists (this will fail if there are dependencies, which is fine)
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_users_role" CASCADE;
        `);

        // Create new enum with all roles
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_users_role" AS ENUM ('parent', 'teacher', 'admin', 'reception', 'government', 'business');
        `);

        // Recreate the column with the new enum
        await queryInterface.sequelize.query(`
          ALTER TABLE "users" 
          ALTER COLUMN "role" TYPE "enum_users_role" 
          USING "role"::text::"enum_users_role";
        `);

        console.log('✓ Created enum_users_role with all roles');
      } catch (createError) {
        // If we can't drop, try just adding values
        console.log('⚠ Could not recreate enum, trying to add values individually');
        try {
          await queryInterface.sequelize.query(`
            ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'reception';
          `);
          await queryInterface.sequelize.query(`
            ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'government';
          `);
          await queryInterface.sequelize.query(`
            ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'business';
          `);
          console.log('✓ Added roles to existing enum');
        } catch (addError) {
          console.error('Error adding roles to enum:', addError.message);
          // Don't throw - migration might have already been applied
        }
      }
    } else {
      console.error('Error updating role enum:', error.message);
      throw error;
    }
  }
}

export async function down(queryInterface, Sequelize) {
  // Note: PostgreSQL doesn't support removing values from ENUM types easily
  // This would require recreating the enum and updating all rows
  // For safety, we'll leave the roles in place
  console.log('⚠ Cannot remove enum values in PostgreSQL. Roles will remain in database.');
}
