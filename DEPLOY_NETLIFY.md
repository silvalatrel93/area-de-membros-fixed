# Deploy no Netlify - Guia Completo

## Pré-requisitos
- Conta no Netlify
- Repositório Git (GitHub, GitLab, ou Bitbucket)
- Banco PostgreSQL já configurado

## Passo 1: Configurar Repositório
```bash
# Se ainda não tem um repositório, crie um
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

## Passo 2: Deploy no Netlify

### Via Dashboard Netlify:
1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte seu repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`

### Variáveis de Ambiente:
No dashboard do Netlify, vá em "Site settings" > "Environment variables" e adicione:

```
DATABASE_URL=postgresql://neondb_owner:npg_9gmzv0WRatBo@ep-hidden-bread-a283w4e5.eu-central-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
```

## Passo 3: Via Netlify CLI (Alternativa)
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=client/dist --functions=netlify/functions

# Configurar variáveis de ambiente
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_9gmzv0WRatBo@ep-hidden-bread-a283w4e5.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

## Arquitetura da Solução

### Frontend (Netlify Static Hosting):
- React app servido como arquivos estáticos
- Todos os componentes, páginas e assets
- Roteamento via wouter

### Backend (Netlify Functions):
- `auth.ts` - Autenticação e login
- `modules.ts` - Gerenciamento de módulos
- `progress.ts` - Sistema de progresso
- Conexão direta com PostgreSQL

### Banco de Dados:
- PostgreSQL Neon Database (externo)
- Conexão via SSL
- Dados persistem independente do Netlify

## URLs da Aplicação

Após deploy, sua aplicação estará disponível em:
- **Frontend**: `https://seu-site.netlify.app`
- **API**: `https://seu-site.netlify.app/.netlify/functions/`

## Monitoramento

### Logs das Functions:
- Dashboard Netlify > Functions > View logs
- Debugging via `console.log` nas functions

### Teste das APIs:
```bash
# Testar login
curl -X POST https://seu-site.netlify.app/.netlify/functions/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Testar módulos
curl https://seu-site.netlify.app/.netlify/functions/modules
```

## Vantagens desta Configuração

1. **Frontend Global**: CDN mundial do Netlify
2. **Backend Serverless**: Escala automaticamente
3. **Banco Persistente**: Dados seguros no Neon
4. **SSL Gratuito**: HTTPS automático
5. **Deploy Automático**: Push = Deploy

## Limitações das Netlify Functions

- Timeout: 10 segundos (Hobby) / 15 minutos (Pro)
- Memória: 1GB
- Cold start: ~100-500ms
- Execuções: 125k/mês (Hobby)

## Alternativas de Deploy

Se preferir outras opções:
- **Vercel**: Similar ao Netlify, mais otimizado para React
- **Railway**: Full-stack com menos configuração
- **Render**: Boa para aplicações Node.js completas