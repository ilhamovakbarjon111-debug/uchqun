import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import Child from '../models/Child.js';
import Activity from '../models/Activity.js';
import Meal from '../models/Meal.js';
import Media from '../models/Media.js';
import Progress from '../models/Progress.js';

dotenv.config();

const removeDemoUsers = async () => {
  try {
    console.log('🔍 Checking for demo users...');

    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Find demo users
    const demoUsers = await User.findAll({
      where: {
        email: ['parent@example.com', 'teacher@example.com'],
      },
    });

    if (demoUsers.length === 0) {
      console.log('✅ No demo users found in database');
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${demoUsers.length} demo user(s):`);
    demoUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // Delete associated data first
    for (const user of demoUsers) {
      if (user.role === 'parent') {
        // Find children
        const children = await Child.findAll({ where: { parentId: user.id } });
        
        if (children.length > 0) {
          console.log(`\n📋 Found ${children.length} child(ren) for ${user.email}`);
          
          for (const child of children) {
            // Delete activities
            const activitiesCount = await Activity.count({ where: { childId: child.id } });
            await Activity.destroy({ where: { childId: child.id } });
            console.log(`   ✅ Deleted ${activitiesCount} activities`);

            // Delete meals
            const mealsCount = await Meal.count({ where: { childId: child.id } });
            await Meal.destroy({ where: { childId: child.id } });
            console.log(`   ✅ Deleted ${mealsCount} meals`);

            // Delete media
            const mediaCount = await Media.count({ where: { childId: child.id } });
            await Media.destroy({ where: { childId: child.id } });
            console.log(`   ✅ Deleted ${mediaCount} media items`);

            // Delete progress
            await Progress.destroy({ where: { childId: child.id } });
            console.log(`   ✅ Deleted progress data`);

            // Delete child
            await child.destroy();
            console.log(`   ✅ Deleted child: ${child.firstName} ${child.lastName}`);
          }
        }
      }

      // Delete user
      await user.destroy();
      console.log(`\n✅ Deleted user: ${user.email}`);
    }

    console.log('\n🎉 All demo users and associated data removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing demo users:', error);
    process.exit(1);
  }
};

removeDemoUsers();



