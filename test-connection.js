// Carrega as variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config();

console.log('Testando conexão com o banco de dados...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

import postgres from 'postgres';

async function testConnection() {
  console.log('Iniciando teste de conexão...');
  
  // Extrai o hostname da URL para verificação
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log('Conectando a:', dbUrl.hostname);
  
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    // Desativa temporariamente a verificação SSL para teste
    ssl: { rejectUnauthorized: false },
    // Habilita logs detalhados
    debug: (connection, query, params) => {
      console.log('Query:', query);
      console.log('Params:', params);
    }
  });

  try {
    console.log('Tentando conectar ao banco de dados...');
    const result = await sql`SELECT 1 as test`;
    console.log('Conexão bem-sucedida! Resultado:', result);
    
    // Tenta listar as tabelas existentes
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tabelas existentes:', tables);
    
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    
    // Mostra mais detalhes do erro, se disponível
    if (error.details) {
      console.error('Detalhes:', error.details);
    }
    
    console.error('Stack:', error.stack);
  } finally {
    await sql.end();
    console.log('Conexão encerrada.');
  }
}

// Executa o teste de conexão
testConnection().catch(console.error);
