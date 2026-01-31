import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'uchqun',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function testConnection() {
  try {
    console.log('🔍 Testing PostgreSQL connection...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'uchqun'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'not set'}`);
    console.log('');

    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Test if database exists
    const [results] = await sequelize.query("SELECT current_database()");
    console.log(`✅ Connected to database: ${results[0].current_database}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('');
    
    if (error.original) {
      console.error('Error details:');
      console.error(`   Code: ${error.original.code}`);
      console.error(`   Message: ${error.original.message}`);
      console.error('');
    }
    
    if (error.original?.code === '28P01') {
      console.error('🔑 Password authentication failed!');
      console.error('');
      console.error('Solutions:');
      console.error('1. Update DB_PASSWORD in .env file with your actual PostgreSQL password');
      console.error('2. Or reset PostgreSQL password:');
      console.error('   - Open pgAdmin or psql');
      console.error('   - Run: ALTER USER postgres WITH PASSWORD \'postgres\';');
      console.error('3. Or find your PostgreSQL password in pg_hba.conf or installation notes');
    } else if (error.original?.code === '3D000') {
      console.error('📁 Database does not exist!');
      console.error('');
      console.error('Create the database:');
      console.error('   createdb uchqun');
      console.error('   Or: psql -U postgres -c "CREATE DATABASE uchqun;"');
    } else {
      console.error('Error:', error.message);
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

testConnection();



