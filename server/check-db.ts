
import { Pool } from '@neondatabase/serverless';

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Checking database status...');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const { rows: tables } = await pool.query(tablesQuery);
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database');
      console.log('📝 Run migration first: npm run migrate');
      return;
    }
    
    console.log('📊 Found tables:');
    for (const table of tables) {
      console.log(`  - ${table.table_name}`);
    }
    
    // Check data counts
    console.log('\n📈 Data counts:');
    for (const table of tables) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${table.table_name}`;
        const { rows } = await pool.query(countQuery);
        console.log(`  - ${table.table_name}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`  - ${table.table_name}: Error counting records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase().catch(console.error);
}

export { checkDatabase };
