
# Database Setup Guide

## Variables de Ambiente Necessárias

### 1. DATABASE_URL (Obrigatória)
Esta é a única variável essencial para o funcionamento do projeto.

**Formato:**
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
```

**Para Neon Database:**
```
DATABASE_URL=postgresql://user:password@ep-example-123456.region.neon.tech/dbname?sslmode=require
```

### 2. Variáveis Opcionais
```
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
```

## Como Configurar

### 1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

### 2. Edite o arquivo `.env` com suas credenciais:
- Substitua `username`, `password`, `hostname`, `port` e `database_name` pelos dados do seu banco PostgreSQL

### 3. Execute as migrações:
```bash
npm run migrate
```

### 4. Verifique a conexão:
```bash
npm run check-db
```

## Estrutura do Banco de Dados

O projeto usa as seguintes tabelas:

### users
- id (serial, primary key)
- username (text, unique)
- password (text)
- is_admin (boolean)
- created_at (timestamp)

### modules
- id (serial, primary key)
- title (text)
- description (text)
- image_url (text)
- order_index (integer)
- is_active (boolean)
- created_at (timestamp)

### lessons
- id (serial, primary key)
- module_id (integer, foreign key)
- title (text)
- description (text)
- video_url (text)
- duration (integer)
- order_index (integer)
- is_active (boolean)
- created_at (timestamp)

### progress
- id (serial, primary key)
- user_id (integer, foreign key)
- lesson_id (integer, foreign key)
- completed_at (timestamp)
- progress_percentage (integer)

## Comandos Úteis

- `npm run migrate` - Executa as migrações do banco
- `npm run check-db` - Verifica o status do banco
- `npm run dev` - Inicia o servidor de desenvolvimento

## Provedores de PostgreSQL Recomendados

1. **Neon** (usado no projeto): https://neon.tech
2. **Supabase**: https://supabase.com
3. **Railway**: https://railway.app
4. **Render**: https://render.com
5. **Heroku Postgres**: https://www.heroku.com/postgres
