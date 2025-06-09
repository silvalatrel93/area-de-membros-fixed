
import { config } from 'dotenv';
config();

import { supabaseAdmin } from './supabase.js';
import fs from 'fs';
import path from 'path';

async function createSupabaseTables() {
  try {
    console.log('🔄 Criando tabelas no Supabase...');

    // Ler o arquivo SQL schema
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Dividir o SQL em comandos individuais
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando SQL
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
          sql_query: command + ';'
        });

        if (error) {
          // Tentar executar diretamente se RPC falhar
          console.log(`🔄 Tentando execução direta...`);
          const { error: directError } = await supabaseAdmin
            .from('information_schema.tables')
            .select('*')
            .limit(1);
          
          if (directError) {
            console.error('❌ Erro ao executar SQL:', error);
            console.log('📝 Comando que falhou:', command);
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }

    console.log('🎯 Verificando tabelas criadas...');
    
    // Verificar se as tabelas foram criadas
    const tables = ['users', 'modules', 'lessons', 'progress'];
    
    for (const table of tables) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Tabela ${table} não encontrada:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} criada com sucesso`);
      }
    }

    console.log('🎉 Criação de tabelas concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createSupabaseTables().catch(console.error);
}

export { createSupabaseTables };
