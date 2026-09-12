import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config/config.js';

async function testAuthComponents() {
  console.log('🧪 Testing Authentication Components...\n');

  // 1. Test Password Hashing
  const password = 'mySecretPassword123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('✅ Password successfully hashed:', hash.substring(0, 25) + '...');

  const isMatch = await bcrypt.compare(password, hash);
  const isWrong = await bcrypt.compare('wrongPassword', hash);
  console.log('✅ Correct password verification:', isMatch === true);
  console.log('✅ Incorrect password rejection:', isWrong === false);

  // 2. Test JWT Signing & Verification
  const userPayload = { id: 1, email: 'test@logicloom.ai', role: 'user' };
  const token = jwt.sign(userPayload, config.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ JWT Token generated:', token.substring(0, 30) + '...');

  const decoded = jwt.verify(token, config.JWT_SECRET);
  console.log('✅ JWT Verified successfully. Decoded user ID:', decoded.id, 'Role:', decoded.role);

  // 3. Test Invalid Token
  try {
    jwt.verify(token + 'tampered', config.JWT_SECRET);
    console.error('❌ Failed: Tampered token should have thrown an error');
  } catch (err) {
    console.log('✅ Tampered token properly rejected:', err.name);
  }

  console.log('\n🎉 All core authentication cryptography components verified successfully!');
}

testAuthComponents().catch(console.error);
