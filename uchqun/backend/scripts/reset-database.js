import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

// Connect to default maintenance DB to manage databases
const sequelize = new Sequelize(
  'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function resetDatabase() {
  const dbName = process.env.DB_NAME || 'uchqun';
  try {
    console.log('🔍 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log(`\n🧹 Resetting database: ${dbName}...`);

    // Terminate active connections
    await sequelize.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = :dbName
        AND pid <> pg_backend_pid();
      `,
      { replacements: { dbName } }
    );

    // Drop and recreate
    await sequelize.query(`DROP DATABASE IF EXISTS "${dbName}";`);
    await sequelize.query(`CREATE DATABASE "${dbName}";`);

    console.log(`✅ Database "${dbName}" reset successfully!`);
    process.exit(0);
  } catch (error) {
    if (error.original) {
      console.error('❌ Error:', error.original.message);
      console.error('   Code:', error.original.code);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();

