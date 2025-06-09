
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure WebSocket for Neon Database
// @ts-ignore
globalThis.WebSocket = ws;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔄 Running database migration...');
    
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '001_initial_schema.sql'), 
      'utf-8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Database tables created:');
    console.log('  - users (authentication)');
    console.log('  - modules (course modules)');
    console.log('  - lessons (video lessons)');
    console.log('  - progress (user progress tracking)');
    console.log('');
    console.log('🎯 Sample data inserted for development');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export { runMigration };
