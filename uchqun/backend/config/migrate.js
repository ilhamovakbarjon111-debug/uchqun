import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Use DATABASE_URL if available (Railway), otherwise use individual env vars
let sequelize;

if (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  sequelize = new Sequelize(
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
}

/**
 * Get all migration files and run them in order
 */
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    const migrationsDir = path.join(__dirname, '../migrations');
    
    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✓ Created migrations directory');
      console.log('⚠ No migrations found. Run migration generation scripts first.');
      return;
    }

    // Get all migration files sorted by name
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('⚠ No migration files found');
      return;
    }

    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭ Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running ${file}...`);
      try {
        const migration = await import(`file://${path.join(migrationsDir, file)}`);
        
        if (typeof migration.up === 'function') {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          await sequelize.query(`INSERT INTO "SequelizeMeta" (name) VALUES ('${file}')`);
          console.log(`✓ Completed ${file}`);
        } else {
          console.warn(`⚠ ${file} does not export an 'up' function`);
        }
      } catch (error) {
        // If error is about existing index/constraint/table, log and continue
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          (error.message.includes('relation') && error.message.includes('already exists'))
        )) {
          console.warn(`⚠ ${file}: ${error.message} - skipping (already exists)`);
          // Mark as executed even if it failed (to avoid retrying)
          try {
            await sequelize.query(`INSERT INTO "SequelizeMeta" (name) VALUES ('${file}') ON CONFLICT (name) DO NOTHING`);
          } catch (insertError) {
            // Ignore insert errors
          }
          continue;
        }
        console.error(`✗ Error running ${file}:`, error.message);
        console.error('Stack:', error.stack);
        throw error;
      }
    }

    console.log('✓ All migrations completed');
    return { success: true, message: 'All migrations completed' };
  } catch (error) {
    console.error('✗ Migration error:', error);
    console.error('Error stack:', error.stack);
    // Don't close connection if called from API route
    const isDirectCall = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
    if (isDirectCall) {
      await sequelize.close();
      process.exit(1);
    }
    throw error;
  } finally {
    // Only close if called directly (not from API)
    const isDirectCall = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
    if (isDirectCall) {
      await sequelize.close();
    }
  }
}

// Run migrations if called directly
try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    runMigrations();
  }
} catch {
  // ignore auto-run detection errors
}

export { runMigrations };



