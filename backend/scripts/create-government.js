import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const createGovernment = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Default government credentials
    const email = 'government@uchqun.com';
    const password = 'government123';
    const firstName = 'Government';
    const lastName = 'User';

    // Check if government user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`\n⚠️  Government account already exists:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n💡 To reset the password, delete the user first or update it manually.`);
      process.exit(0);
    }

    // Create government account
    console.log('\n🏛️  Creating government account...');
    const government = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'government',
      isActive: true,
    });

    console.log('\n✅ Government account created successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✨ You can now log in to the government panel with these credentials.');
    console.log('\n⚠️  Remember to change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating government account:', error);
    process.exit(1);
  }
};

createGovernment();
