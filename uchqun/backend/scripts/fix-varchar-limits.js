import sequelize from '../config/database.js';
import '../models/index.js'; // Load all models

async function fixVarcharLimits() {
  try {
    console.log('Fixing VARCHAR limits in database...');

    // Fix Media table
    await sequelize.query(`
      ALTER TABLE media 
      ALTER COLUMN url TYPE TEXT,
      ALTER COLUMN thumbnail TYPE TEXT,
      ALTER COLUMN title TYPE VARCHAR(500);
    `);
    console.log('✓ Fixed Media table');

    // Fix Activity table
    await sequelize.query(`
      ALTER TABLE activities 
      ALTER COLUMN title TYPE VARCHAR(500),
      ALTER COLUMN teacher TYPE VARCHAR(255);
    `);
    console.log('✓ Fixed Activity table');

    // Fix Meal table
    await sequelize.query(`
      ALTER TABLE meals 
      ALTER COLUMN "mealName" TYPE VARCHAR(500),
      ALTER COLUMN quantity TYPE VARCHAR(255);
    `);
    console.log('✓ Fixed Meal table');

    // Fix Child table
    await sequelize.query(`
      ALTER TABLE children 
      ALTER COLUMN photo TYPE TEXT,
      ALTER COLUMN school TYPE VARCHAR(500),
      ALTER COLUMN class TYPE VARCHAR(255),
      ALTER COLUMN teacher TYPE VARCHAR(255),
      ALTER COLUMN "disabilityType" TYPE VARCHAR(500);
    `);
    console.log('✓ Fixed Child table');

    console.log('\n✅ All VARCHAR limits fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing VARCHAR limits:', error);
    process.exit(1);
  }
}

fixVarcharLimits();



