import { config } from 'dotenv';
config();

import pg from 'pg';

const { Pool } = pg;

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('DATABASE_URL exists:', !!databaseUrl);
  
  try {
    const pool = new Pool({ connectionString: databaseUrl });
    const result = await pool.query('SELECT NOW() as time, version() as postgres_version');
    console.log('✅ Supabase connection successful!');
    console.log('📊 Server time:', result.rows[0].time);
    console.log('🗄️ PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection().catch(console.error);