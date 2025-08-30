// db-test.js - Script to test database connection
import { executeQuery, initializeDatabase } from './lib/db.js';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const result = await executeQuery('SELECT 1 as test');
    
    console.log('Database connection successful!');
    console.log('Test query result:', result);
    
    console.log('\nInitializing database and creating tables if needed...');
    await initializeDatabase();
    console.log('Database initialization complete!');
    
    console.log('\nFetching existing schools...');
    const schools = await executeQuery('SELECT COUNT(*) as count FROM schools');
    console.log(`Found ${schools[0].count} school(s) in the database.`);
    
    console.log('\nDatabase is ready for use!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error details:', error);
    console.error('\nPlease check:');
    console.error('1. Database server is running');
    console.error('2. Database credentials in .env.local are correct');
    console.error('3. Database "school_management" exists');
    console.error('4. User has proper permissions');
    process.exit(1);
  }
}

testDatabaseConnection();
