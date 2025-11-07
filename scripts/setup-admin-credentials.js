const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdminCredentials() {
  console.log('🔐 Admin Credentials Setup\n');
  console.log('This script will help you set up secure admin credentials.\n');
  
  const username = await question('Enter admin username: ');
  const password = await question('Enter admin password: ');
  
  if (!username || !password) {
    console.error('❌ Username and password are required!');
    rl.close();
    process.exit(1);
  }
  
  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('\n✅ Credentials hashed successfully!\n');
  console.log('Add these to your .env.local file:\n');
  console.log(`ADMIN_USERNAME=${username}`);
  console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}\n`);
  console.log('⚠️  Keep these credentials secure and never commit them to version control!');
  
  rl.close();
}

setupAdminCredentials().catch(console.error);

