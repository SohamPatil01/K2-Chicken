const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function clearUsers() {
  const client = await pool.connect()
  
  try {
    console.log('🗑️  Clearing all user registrations...\n')
    
    // First, let's see how many users exist
    const countResult = await client.query('SELECT COUNT(*) FROM users')
    const userCount = parseInt(countResult.rows[0].count)
    
    if (userCount === 0) {
      console.log('✅ No users found. Database is already empty.')
      return
    }
    
    console.log(`📊 Found ${userCount} user(s) to delete\n`)
    
    // Delete all users
    // Note: user_addresses will be automatically deleted due to ON DELETE CASCADE
    // Note: orders.user_id will be set to NULL due to ON DELETE SET NULL
    const result = await client.query('DELETE FROM users')
    
    console.log(`✅ Successfully deleted ${userCount} user(s)`)
    console.log('✅ User addresses have been automatically deleted (CASCADE)')
    console.log('✅ Order user references have been cleared (SET NULL)')
    console.log('\n✨ All user registrations have been cleared!')
    
  } catch (error) {
    console.error('❌ Error clearing users:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the script
clearUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

