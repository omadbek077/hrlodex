/**
 * Admin foydalanuvchi yaratish skripti.
 * .env da ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME o'rnating yoki buyruqda bering.
 *
 * Ishlatish:
 *   node scripts/create-admin.js
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 ADMIN_FULL_NAME="Admin User" node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL_CLI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_CLI;
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || process.env.ADMIN_FULL_NAME_CLI || 'Admin';

async function createAdmin() {
  if (!ADMIN_EMAIL) {
    console.error('Xato: ADMIN_EMAIL majburiy.');
    console.error('');
    console.error('.env faylida o\'rnating:');
    console.error('  ADMIN_EMAIL=admin@example.com');
    console.error('  ADMIN_PASSWORD=parol123   (yangi admin yaratishda)');
    console.error('  ADMIN_FULL_NAME="Admin Ism"');
    console.error('');
    console.error('Yoki buyruqda:');
    console.error('  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=parol123 node scripts/create-admin.js');
    process.exit(1);
  }

  await connectDB();

  const email = ADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email }).select('+password');

  if (user) {
    user.role = 'admin';
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: true });
    console.log('Mavjud foydalanuvchi admin qilindi:', email);
  } else {
    if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 6) {
      console.error('Xato: Yangi admin uchun ADMIN_PASSWORD majburiy (kamida 6 belgi).');
      process.exit(1);
    }
    user = await User.create({
      fullName: ADMIN_FULL_NAME.trim(),
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('Yangi admin yaratildi:', email);
  }

  console.log('Admin email:', user.email);
  console.log('Admin ism:', user.fullName);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Xato:', err.message);
  process.exit(1);
});
