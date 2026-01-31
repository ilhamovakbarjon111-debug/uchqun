import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const email = 'admin@uchqun.com';
    const newPassword = 'admin123';

    // Find admin user
    const admin = await User.findOne({ where: { email } });
    if (!admin) {
      console.log(`\n❌ Admin account not found with email: ${email}`);
      console.log(`\n💡 Run 'npm run create:admin' to create the admin account first.`);
      process.exit(1);
    }

    console.log(`\n👑 Found admin account:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}`);
    
    // Check current password hash
    const currentHash = admin.password;
    const isHashValid = currentHash && currentHash.startsWith('$2');
    
    if (isHashValid) {
      console.log(`\n⚠️  Password is already hashed.`);
      console.log(`   Hash prefix: ${currentHash.substring(0, 7)}...`);
    } else {
      console.log(`\n⚠️  Password is NOT properly hashed!`);
      console.log(`   Current value: ${currentHash ? currentHash.substring(0, 20) + '...' : 'null/undefined'}`);
    }

    // Reset password (will be hashed by beforeUpdate hook)
    console.log(`\n🔄 Resetting password to: ${newPassword}`);
    admin.password = newPassword;
    await admin.save();

    // Verify the hash
    const updatedAdmin = await User.findOne({ where: { email } });
    const newHash = updatedAdmin.password;
    const isNewHashValid = newHash && newHash.startsWith('$2');

    if (isNewHashValid) {
      console.log(`\n✅ Password reset successfully!`);
      console.log(`   New hash prefix: ${newHash.substring(0, 7)}...`);
      
      // Test password comparison
      const testCompare = await updatedAdmin.comparePassword(newPassword);
      if (testCompare) {
        console.log(`\n✅ Password verification test: PASSED`);
      } else {
        console.log(`\n❌ Password verification test: FAILED`);
        console.log(`   This indicates a problem with password hashing.`);
      }
    } else {
      console.log(`\n❌ Password reset failed - hash is still invalid!`);
      console.log(`   This indicates a problem with the User model hooks.`);
      process.exit(1);
    }

    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n✨ You can now log in with these credentials.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

resetAdminPassword();






