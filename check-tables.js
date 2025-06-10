import postgres from 'postgres';

async function checkTables() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tabelas existentes no banco de dados:');
    console.log(result);
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  } finally {
    await sql.end();
  }
}

checkTables();
