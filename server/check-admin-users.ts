
import { config } from "dotenv";
import { db } from "./db";
import { users } from "@shared/schema";

config();

async function checkAdminUsers() {
  console.log("=== VERIFICAÇÃO DE USUÁRIOS ADMIN ===\n");
  
  // Verificar variáveis de ambiente
  console.log("1. CREDENCIAIS DAS VARIÁVEIS DE AMBIENTE:");
  console.log("Usuário Estudante:");
  console.log(`  Email: ${process.env.STUDENT_EMAIL || "aluno@exemplo.com"}`);
  console.log(`  Senha: ${process.env.STUDENT_PASSWORD || "123456"}`);
  
  console.log("\nUsuário Admin:");
  console.log(`  Email: ${process.env.ADMIN_EMAIL || "admin@exemplo.com"}`);
  console.log(`  Senha: ${process.env.ADMIN_PASSWORD || "admin123"}`);
  
  // Verificar se existe tabela de usuários no banco
  try {
    console.log("\n2. VERIFICANDO TABELA DE USUÁRIOS NO BANCO:");
    const dbUsers = await db.select().from(users).limit(10);
    
    if (dbUsers.length > 0) {
      console.log(`Encontrados ${dbUsers.length} usuários no banco de dados:`);
      dbUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. Email: ${user.email}, Admin: ${user.isAdmin ? 'Sim' : 'Não'}, Ativo: ${user.isActive ? 'Sim' : 'Não'}`);
      });
    } else {
      console.log("Nenhum usuário encontrado na tabela 'users'.");
    }
  } catch (error) {
    console.log("Tabela 'users' não existe ou erro ao acessar:", error);
  }
  
  console.log("\n3. INFORMAÇÕES DO SISTEMA DE AUTENTICAÇÃO:");
  console.log("O sistema atual usa autenticação por variáveis de ambiente.");
  console.log("Para alterar as credenciais, edite o arquivo .env:");
  console.log("  STUDENT_EMAIL=novo_email_estudante@exemplo.com");
  console.log("  STUDENT_PASSWORD=nova_senha_estudante");
  console.log("  ADMIN_EMAIL=novo_email_admin@exemplo.com");
  console.log("  ADMIN_PASSWORD=nova_senha_admin");
  
  console.log("\n=== FIM DA VERIFICAÇÃO ===");
}

checkAdminUsers().catch(console.error);
