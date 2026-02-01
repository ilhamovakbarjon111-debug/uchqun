import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

// Connect to default 'postgres' database to create our database
const sequelize = new Sequelize(
  'postgres', // Connect to default database
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function createDatabase() {
  try {
    console.log('🔍 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');
    
    const dbName = process.env.DB_NAME || 'uchqun';
    console.log(`\n📁 Creating database: ${dbName}...`);
    
    // Create database
    await sequelize.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✅ Database "${dbName}" created successfully!`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    if (error.original) {
      if (error.original.code === '42P04') {
        console.log('ℹ️  Database already exists!');
        process.exit(0);
      } else {
        console.error('❌ Error:', error.original.message);
        console.error('   Code:', error.original.code);
      }
    } else {
      console.error('❌ Error:', error.message);
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

createDatabase();



