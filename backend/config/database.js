const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

let db;

async function setupDatabase() {
  try {
    // PostgreSQL setup
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'umroh_management',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20, // max number of clients in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
    
    // Use connection string if provided
    if (process.env.DATABASE_URL) {
      db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: dbConfig.ssl });
    } else {
      db = new Pool(dbConfig);
    }
    
    // Test connection
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log('PostgreSQL database connected successfully');
    
    // Check if database has tables
    await checkAndInitializeSchema();
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

async function query(sql, params = []) {
  try {
    // Convert MySQL placeholders (?) to PostgreSQL ($1, $2, etc.)
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    const result = await db.query(pgSql, params);
    return { 
      rows: result.rows,
      fields: result.fields,
      rowCount: result.rowCount,
      insertId: result.rows[0]?.id || null
    };
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

async function getClient() {
  const client = await db.connect();
  return {
    query: async (sql, params = []) => {
      // Convert MySQL placeholders to PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      const result = await client.query(pgSql, params);
      return { 
        rows: result.rows, 
        fields: result.fields, 
        rowCount: result.rowCount,
        insertId: result.rows[0]?.id || null
      };
    },
    release: () => client.release(),
    begin: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK')
  };
}

async function closeDatabase() {
  try {
    await db.end();
    console.log('PostgreSQL database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

// Set user context for audit logging (PostgreSQL session variables)
async function setUserContext(userId, ipAddress) {
  await query('SELECT set_config($1, $2, false)', ['app.current_user_id', userId?.toString() || '']);
  await query('SELECT set_config($1, $2, false)', ['app.current_ip', ipAddress || '']);
}

// Helper function for transactions
async function transaction(callback) {
  const client = await getClient();
  try {
    await client.begin();
    const result = await callback(client);
    await client.commit();
    return result;
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
}

// Check and initialize schema if database is empty
async function checkAndInitializeSchema() {
  try {
    // Check if any tables exist
    const tablesResult = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tableCount = parseInt(tablesResult.rows[0].count);
    
    if (tableCount === 0) {
      console.log('Database is empty, initializing schema...');
      await initializeSchema();
    } else {
      console.log(`Database already has ${tableCount} tables, skipping schema initialization`);
    }
  } catch (error) {
    console.error('Error checking database schema:', error);
    throw error;
  }
}

// Initialize database schema
async function initializeSchema() {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // Look for schema file
    const schemaPath = path.join(__dirname, '../../database/schema-postgres.sql');
    
    // Check if PostgreSQL schema exists, fallback to MySQL schema
    let schemaSQL;
    try {
      schemaSQL = await fs.readFile(schemaPath, 'utf8');
      console.log('Using PostgreSQL schema');
    } catch (error) {
      // Fallback to MySQL schema if PostgreSQL version not found
      const mysqlSchemaPath = path.join(__dirname, '../../database/schema.sql');
      console.log('PostgreSQL schema not found, converting from MySQL schema');
      
      let mysqlSchema = await fs.readFile(mysqlSchemaPath, 'utf8');
      
      // Basic MySQL to PostgreSQL conversion
      schemaSQL = mysqlSchema
        .replace(/AUTO_INCREMENT/g, '')
        .replace(/INT PRIMARY KEY AUTO_INCREMENT/g, 'SERIAL PRIMARY KEY')
        .replace(/INT\s+AUTO_INCREMENT/g, 'SERIAL')
        .replace(/TINYINT\(1\)/g, 'BOOLEAN')
        .replace(/TINYINT/g, 'SMALLINT')
        .replace(/DATETIME/g, 'TIMESTAMP')
        .replace(/`/g, '"')
        .replace(/ENGINE=InnoDB[^;]*/g, '')
        .replace(/DEFAULT CHARSET=[^;]*/g, '')
        .replace(/ON UPDATE CURRENT_TIMESTAMP/g, '');
    }
    
    // Execute schema
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        !stmt.includes('CREATE DATABASE') &&
        !stmt.includes('USE ')
      );
    
    console.log(`Executing ${statements.length} schema statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (error) {
          // Some statements might fail if they already exist
          if (!error.message.includes('already exists')) {
            console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
            console.error(error.message);
          }
        }
      }
    }
    
    // Create default admin user if not exists
    await createDefaultAdmin();
    
    console.log('Schema initialization completed successfully');
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  }
}

// Create default admin user
async function createDefaultAdmin() {
  try {
    const adminCheck = await query('SELECT COUNT(*) as count FROM users WHERE username = $1', ['admin']);
    
    if (parseInt(adminCheck.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await query(`
        INSERT INTO users (username, email, password_hash, full_name, role_name, phone) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin', 'admin@umroh.com', hashedPassword, 'Administrator', 'Admin', '081234567890']);
      
      console.log('Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Export for PostgreSQL compatibility
module.exports = {
  setupDatabase,
  query,
  getClient,
  closeDatabase,
  setUserContext,
  transaction,
  db: () => db
};