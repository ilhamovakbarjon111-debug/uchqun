import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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

async function listTables() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = (rows || [])
      .map((r) => r.table_name)
      .filter(Boolean);

    console.log('Tables in public schema:');
    if (tables.length === 0) {
      console.log('(none)');
    } else {
      for (const t of tables) console.log('-', t);
    }
  } catch (err) {
    console.error('list-tables failed:', err?.original?.message || err?.message || err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

listTables();

