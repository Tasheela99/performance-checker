const bcrypt = require('bcryptjs');

async function test() {
  const password = 'Admin@123456';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('Original password:', password);
  console.log('Hashed password:', hashedPassword);
  
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password matches:', isValid);
}

test().catch(console.error);
