
import postgres from 'postgres';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const sql = postgres(process.env.DATABASE_URL!, {
    ssl: { 
      require: true,
      rejectUnauthorized: false 
    },
    debug: (connection, query, params) => {
      console.log('Query:', query);
      console.log('Params:', params);
    }
  });

  try {
    console.log('🔄 Running database migration...');

    const migrationDir = join(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`📄 Executing ${file}...`);
      const migrationSQL = readFileSync(join(migrationDir, file), "utf-8");
      await sql.unsafe(migrationSQL);
    }

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
    await sql.end();
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export { runMigration };
