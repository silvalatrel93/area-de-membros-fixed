
# 🚀 Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Digite o nome do projeto
6. Defina uma senha forte para o banco
7. Escolha a região (recomendado: São Paulo - South America)
8. Clique em "Create new project"

## 2. Obter Credenciais

Após criar o projeto, vá para **Settings > API**:

- **URL**: Copie a "Project URL"
- **Anon Key**: Copie a "anon/public" key
- **Service Role**: Copie a "service_role" key (⚠️ Mantenha segura!)

## 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione:

```bash
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico

# Database URL (Settings > Database > Connection string > Nodejs)
SUPABASE_DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres
```

## 4. Executar Migração Completa

```bash
# Criar tabelas e migrar dados
npm run full-migration
```

## 5. Verificar no Dashboard

1. Acesse **Table Editor** no Supabase Dashboard
2. Verifique se as tabelas foram criadas:
   - `users` (usuários)
   - `modules` (módulos)
   - `lessons` (lições)
   - `progress` (progresso)

## 6. Testar Aplicação

```bash
npm run dev
```

## 🔧 Comandos Disponíveis

- `npm run create:tables` - Criar apenas as tabelas
- `npm run migrate:supabase` - Migrar apenas os dados
- `npm run full-migration` - Criar tabelas + migrar dados
- `npm run dev` - Iniciar aplicação

## 🛠️ Solução de Problemas

### Erro: "relation does not exist"
- Execute `npm run create:tables` primeiro
- Ou crie as tabelas manualmente no SQL Editor

### Erro: "Invalid API key"
- Verifique se as chaves estão corretas no `.env`
- Confirme se não há espaços extras nas variáveis

### Erro: "Connection refused"
- Verifique a SUPABASE_DATABASE_URL
- Confirme se a senha está correta
- Teste a conexão no Supabase Dashboard

## 📊 Estrutura das Tabelas

### Users
- `id`, `username`, `email`, `password`, `is_admin`

### Modules  
- `id`, `title`, `description`, `order_index`, `materials_url`

### Lessons
- `id`, `module_id`, `title`, `description`, `video_url`, `duration`

### Progress
- `id`, `user_id`, `lesson_id`, `completed`, `completed_at`
