
import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

async function testConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Horário do servidor:', result.rows[0].current_time);
    console.log('🗄️ Versão do PostgreSQL:', result.rows[0].postgres_version.split(' ')[0]);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.log('🔧 Verifique se a senha está correta no .env');
  }
}

testConnection();
