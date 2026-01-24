/**
 * Authentication Check Script
 * 
 * This script helps diagnose 401 authentication errors
 * Run: node backend/scripts/check-auth.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from '../config/database.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkAuth() {
  console.log('🔍 Checking Authentication Configuration...\n');

  // Check JWT Secrets
  console.log('1. JWT Configuration:');
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret) {
    console.log('   ❌ JWT_SECRET is not set');
  } else if (jwtSecret.length < 32) {
    console.log(`   ⚠️  JWT_SECRET is too short (${jwtSecret.length} chars, need at least 32)`);
  } else {
    console.log(`   ✅ JWT_SECRET is set (${jwtSecret.length} chars)`);
  }

  if (!jwtRefreshSecret) {
    console.log('   ❌ JWT_REFRESH_SECRET is not set');
  } else if (jwtRefreshSecret.length < 32) {
    console.log(`   ⚠️  JWT_REFRESH_SECRET is too short (${jwtRefreshSecret.length} chars, need at least 32)`);
  } else {
    console.log(`   ✅ JWT_REFRESH_SECRET is set (${jwtRefreshSecret.length} chars)`);
  }

  if (jwtSecret && jwtRefreshSecret && jwtSecret === jwtRefreshSecret) {
    console.log('   ❌ JWT_SECRET and JWT_REFRESH_SECRET must be different');
  } else if (jwtSecret && jwtRefreshSecret) {
    console.log('   ✅ JWT secrets are different');
  }

  // Check Database Connection
  console.log('\n2. Database Connection:');
  try {
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    return;
  }

  // Check Users
  console.log('\n3. User Accounts:');
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive', 'documentsApproved'],
      limit: 10,
    });

    if (users.length === 0) {
      console.log('   ⚠️  No users found in database');
      console.log('   💡 Run: npm run seed (to create sample users)');
    } else {
      console.log(`   ✅ Found ${users.length} user(s):`);
      users.forEach(user => {
        const status = user.role === 'reception' 
          ? (user.documentsApproved && user.isActive ? '✅ Active' : '⚠️  Pending Approval')
          : (user.isActive !== false ? '✅ Active' : '⚠️  Inactive');
        console.log(`      - ${user.email} (${user.role}) ${status}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Error checking users:', error.message);
  }

  // Test Login
  console.log('\n4. Test Login:');
  const testEmail = process.argv[2] || 'parent@example.com';
  const testPassword = process.argv[3] || 'password';
  
  try {
    const user = await User.findOne({ where: { email: testEmail.toLowerCase() } });
    if (!user) {
      console.log(`   ⚠️  User not found: ${testEmail}`);
      console.log('   💡 Create user or use existing email');
    } else {
      console.log(`   ✅ User found: ${user.email}`);
      
      if (!user.password) {
        console.log('   ❌ User has no password set');
      } else if (!user.password.startsWith('$2')) {
        console.log('   ❌ User password is not properly hashed');
      } else {
        console.log('   ✅ User password is properly hashed');
        
        // Test password
        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.default.compare(testPassword, user.password);
        if (isValid) {
          console.log(`   ✅ Password is correct for: ${testEmail}`);
        } else {
          console.log(`   ❌ Password is incorrect for: ${testEmail}`);
        }
      }

      // Check account status
      if (user.role === 'reception') {
        if (!user.documentsApproved || !user.isActive) {
          console.log('   ⚠️  Reception account not approved/active');
          console.log('   💡 Admin must approve this account');
        } else {
          console.log('   ✅ Reception account is approved and active');
        }
      } else if (user.role === 'admin' && user.email !== 'superadmin@uchqun.uz') {
        if (!user.isActive) {
          console.log('   ⚠️  Admin account is not active');
          console.log('   💡 Super-admin must activate this account');
        } else {
          console.log('   ✅ Admin account is active');
        }
      }
    }
  } catch (error) {
    console.log('   ❌ Error testing login:', error.message);
  }

  console.log('\n📝 Summary:');
  console.log('   If you see ❌ errors above, fix them first');
  console.log('   If all checks pass ✅, the issue might be:');
  console.log('   - Wrong email/password');
  console.log('   - CORS configuration');
  console.log('   - Network/firewall issues');
  console.log('\n💡 For more help, see: backend/TROUBLESHOOTING_401.md');

  await sequelize.close();
}

checkAuth().catch(console.error);
