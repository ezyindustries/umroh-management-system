const fs = require('fs').promises;
const path = require('path');
const { setupDatabase, query, closeDatabase } = require('../config/database');

async function runMigration(migrationFile) {
  try {
    console.log('Setting up database connection...');
    await setupDatabase();
    
    console.log(`Running migration: ${migrationFile}`);
    const migrationPath = path.join(__dirname, '../../database/migrations', migrationFile);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Split into statements and execute
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*')
      );
    
    console.log(`Executing ${statements.length} migration statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await query(statement);
        } catch (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Get migration file from command line args
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please specify a migration file');
  process.exit(1);
}

runMigration(migrationFile);