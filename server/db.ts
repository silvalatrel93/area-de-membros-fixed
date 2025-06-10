import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function createConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
  }
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de conectar ao banco de dados...`);
      
      const pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 1,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 10000,
      });

      // Teste a conexão
      await pool.query('SELECT 1');
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
      
      return pool;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Tentativa ${attempt} falhou:`, errorMessage);
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Falha ao conectar ao banco de dados após ${MAX_RETRIES} tentativas: ${errorMessage}`);
      }
      
      // Espera antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  // Esta linha nunca deve ser alcançada devido ao throw no último retry
  throw new Error('Erro inesperado ao conectar ao banco de dados');
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

export async function initDatabase() {
  try {
    pool = await createConnection();
    if (!pool) throw new Error('Falha ao criar conexão com o banco de dados');
    
    db = drizzle(pool, { schema });
    return db;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro fatal ao inicializar o banco de dados:', errorMessage);
    process.exit(1);
  }
}

export { db };
