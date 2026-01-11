import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function createSuperAdmin() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await User.sync();

    // Super admin details
    const superAdminData = {
      email: 'superadmin@uchqun.uz',
      password: 'SuperAdmin@2026', // Change this password!
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      phone: '+998901234567',
      status: 'active'
    };

    // Check if super admin already exists
    const existing = await User.findOne({
      where: { email: superAdminData.email }
    });

    if (existing) {
      console.log('⚠️  Super admin already exists!');
      console.log('Email:', existing.email);
      console.log('Role:', existing.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Create super admin
    const superAdmin = await User.create({
      ...superAdminData,
      password: hashedPassword
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', superAdminData.email);
    console.log('🔑 Password:', superAdminData.password);
    console.log('👤 Name:', `${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log('🎭 Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

createSuperAdmin();
