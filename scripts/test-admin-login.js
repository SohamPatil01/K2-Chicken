const bcrypt = require('bcryptjs');

// Test the password hash
const passwordHash = '$2b$10$UEW8R3Ipg.qbj/RcOSi9L.1g7lHamODLJyyxw6vTblhNC4B6NAlnW';
const testPassword = 'admin123';

console.log('Testing admin login credentials...\n');

bcrypt.compare(testPassword, passwordHash)
  .then(isValid => {
    if (isValid) {
      console.log('✅ Password hash is valid!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('❌ Password hash is invalid!');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

