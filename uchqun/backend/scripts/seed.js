import dotenv from 'dotenv';
import { syncDatabase } from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (force: true will drop existing tables)
    await syncDatabase(true);
    console.log('✅ Database synchronized');
    console.log('✅ Database tables created successfully');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create teacher accounts using the API: POST /api/auth/register (if implemented)');
    console.log('   2. Teachers can create parent accounts: POST /api/teacher/parents');
    console.log('   3. Parents log in with teacher-provided credentials');
    console.log('\n✨ You can now start the server with: npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

