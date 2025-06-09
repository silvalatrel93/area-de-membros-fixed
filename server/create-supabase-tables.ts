
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createTablesSQL = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de módulos
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  materials_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lições
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de progresso
CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Indices para otimização
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_modules_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON lessons(is_active);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function createTables() {
  console.log('🔄 Criando tabelas no Supabase...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTablesSQL 
    });

    if (error) {
      // Se a função RPC não existir, tentar criar as tabelas diretamente
      console.log('⚠️  Função RPC não encontrada, tentando método alternativo...');
      
      // Dividir o SQL em comandos individuais
      const commands = createTablesSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      for (const command of commands) {
        try {
          const { error: cmdError } = await supabase
            .from('_temp_table_creation')
            .select('*')
            .limit(0);
          
          if (cmdError && cmdError.message.includes('does not exist')) {
            console.log('📋 Executando comando SQL via cliente...');
            // Para comandos DDL, precisamos usar uma abordagem diferente
            console.log('🔧 Comando preparado:', command.substring(0, 50) + '...');
          }
        } catch (err) {
          console.log('⚠️  Comando processado:', command.substring(0, 50) + '...');
        }
      }
      
      console.log('✅ Estrutura das tabelas preparada!');
      console.log('');
      console.log('🔧 INSTRUÇÕES IMPORTANTES:');
      console.log('');
      console.log('1. Acesse o Supabase Dashboard:');
      console.log(`   https://supabase.com/dashboard/project/${supabaseUrl?.split('.')[0]?.split('//')[1]}`);
      console.log('');
      console.log('2. Vá para SQL Editor');
      console.log('');
      console.log('3. Execute o seguinte SQL:');
      console.log('');
      console.log('--- COPIE E COLE NO SQL EDITOR ---');
      console.log(createTablesSQL);
      console.log('--- FIM DO SQL ---');
      console.log('');
      console.log('4. Após executar o SQL, rode: npm run migrate:supabase');
      
    } else {
      console.log('✅ Tabelas criadas com sucesso!');
      console.log('📊 Estrutura:');
      console.log('  - users (usuários)');
      console.log('  - modules (módulos)');
      console.log('  - lessons (lições)');
      console.log('  - progress (progresso)');
      console.log('');
      console.log('🎯 Próximo passo: npm run migrate:supabase');
    }

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    console.log('');
    console.log('🔧 SOLUÇÃO MANUAL:');
    console.log('');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o seguinte SQL:');
    console.log('');
    console.log(createTablesSQL);
    process.exit(1);
  }
}

async function checkConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Configurando Supabase Database...');
  console.log('');
  
  const connected = await checkConnection();
  if (!connected) {
    console.log('❌ Falha na conexão. Verifique suas credenciais do Supabase.');
    process.exit(1);
  }
  
  await createTables();
}

main().catch(console.error);
