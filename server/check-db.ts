import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import * as schema from '../shared/schema';

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL must be set");
    process.exit(1);
  }

  console.log('🔍 Connecting to database...');
  
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });
  
  try {
    // Test connection
    console.log('✅ Database connection successful!');
    
    // Check tables
    const modules = await db.select().from(schema.modules);
    console.log('\n📚 Modules:', modules.length);
    for (const module of modules) {
      console.log(`  - ${module.title}`);
    }
    
    const lessons = await db.select().from(schema.lessons);
    console.log('\n📝 Lessons:', lessons.length);
    
    const users = await db.select().from(schema.users);
    console.log('\n👥 Users:', users.length);
    
    const progress = await db.select().from(schema.progress);
    console.log('\n📊 Progress records:', progress.length);
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { checkDatabase };
