import { config } from 'dotenv';
config();

import pg from 'pg';

const { Pool } = pg;

async function testConnection() {
  console.log('Testing database connections...');
  
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  const regularUrl = process.env.DATABASE_URL;
  
  console.log('SUPABASE_DATABASE_URL exists:', !!supabaseUrl);
  console.log('DATABASE_URL exists:', !!regularUrl);
  
  if (supabaseUrl) {
    console.log('Testing Supabase connection...');
    try {
      const supabasePool = new Pool({ connectionString: supabaseUrl });
      const result = await supabasePool.query('SELECT NOW() as time, COUNT(*) as modules FROM modules');
      console.log('✅ Supabase connection successful:', result.rows[0]);
      await supabasePool.end();
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
    }
  }
  
  if (regularUrl && regularUrl !== supabaseUrl) {
    console.log('Testing regular DB connection...');
    try {
      const regularPool = new Pool({ connectionString: regularUrl });
      const result = await regularPool.query('SELECT NOW() as time');
      console.log('✅ Regular DB connection successful:', result.rows[0]);
      await regularPool.end();
    } catch (error) {
      console.error('❌ Regular DB connection failed:', error.message);
    }
  }
}

testConnection().catch(console.error);