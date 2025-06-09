
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

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

if (require.main === module) {
  runMigration().catch(console.error);
}

export { runMigration };
