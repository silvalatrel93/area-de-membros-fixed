# 🚀 Guia de Deploy no Netlify - Passo a Passo

## 📋 **Preparação Concluída ✅**
- Build configurado e testado
- Netlify Functions prontas
- Configuração netlify.toml ok

## 🗂️ **Passo 1: Criar Repositório no GitHub**

### 1.1 No GitHub:
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome sugerido: `area-de-membros`
4. Deixe como **público** ou **privado** (sua escolha)
5. **NÃO** marque "Add README" (já temos arquivos)
6. Clique "Create repository"

### 1.2 No seu computador:
```powershell
# Adicionar repositório remoto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/area-de-membros.git

# Enviar código para GitHub
git push -u origin main
```

## 🌐 **Passo 2: Deploy no Netlify**

### 2.1 Acessar Netlify:
1. Vá para [netlify.com](https://netlify.com)
2. Faça login ou crie conta (pode usar GitHub)
3. Clique em **"Add new site"** > **"Import an existing project"**

### 2.2 Conectar Repositório:
1. Escolha **"Deploy with GitHub"**
2. Autorize o Netlify a acessar suas contas
3. Selecione o repositório `area-de-membros`

### 2.3 Configurar Build:
- **Branch to deploy**: `main`
- **Build command**: `npm run build` (já preenchido automaticamente)
- **Publish directory**: `client/dist` (vai detectar automaticamente)
- **Functions directory**: `netlify/functions` (automático)

### 2.4 Clique em **"Deploy site"**

## ⚙️ **Passo 3: Configurar Variáveis de Ambiente**

### 3.1 No Dashboard do Netlify:
1. Após o deploy, vá em **"Site settings"**
2. No menu lateral, clique em **"Environment variables"**
3. Clique em **"Add variable"**

### 3.2 Adicionar estas variáveis:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_9gmzv0WRatBo@ep-hidden-bread-a283w4e5.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `NODE_ENV` | `production` |
| `ADMIN_EMAIL` | `admin@admin.com` |
| `ADMIN_PASSWORD` | `admin123` |
| `STUDENT_EMAIL` | `aluno@aluno.com` |
| `STUDENT_PASSWORD` | `123456` |

### 3.3 Depois de adicionar as variáveis:
1. Clique em **"Deploys"** no menu superior
2. Clique em **"Trigger deploy"** > **"Deploy site"**

## 🧪 **Passo 4: Testar a Aplicação**

### 4.1 Acessar o Site:
- URL estará disponível no dashboard (ex: `https://eloquent-unicorn-123456.netlify.app`)

### 4.2 Testar Funcionalidades:
- ✅ Login admin: `admin@admin.com` / `admin123`
- ✅ Login aluno: `aluno@aluno.com` / `123456`
- ✅ Dashboard do aluno
- ✅ Painel administrativo
- ✅ Criação/edição de módulos e aulas

## 🔧 **Passo 5: Configurar Domínio Personalizado (Opcional)**

### 5.1 No Dashboard:
1. Vá em **"Domain settings"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `meusite.com`)
4. Configure DNS conforme instruções do Netlify

## 📊 **Monitoramento e Logs**

### 5.1 Ver Logs das Functions:
1. Dashboard > **"Functions"**
2. Clique em qualquer function
3. **"View logs"** para debug

### 5.2 Analytics:
- Dashboard mostra visitantes, requests, etc.

## 🚨 **Resolução de Problemas**

### Se o site não carregar:
1. Verifique **"Deploys"** > **"Deploy log"**
2. Confirme se as variáveis de ambiente estão corretas
3. Teste as functions individualmente

### Se o login não funcionar:
1. Verifique **"Functions"** > **"auth"** > **"View logs"**
2. Confirme variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.

### Se a API não responder:
1. Teste diretamente: `https://seu-site.netlify.app/.netlify/functions/auth`
2. Verifique `DATABASE_URL` está correto

## 🎉 **Próximos Passos**

Após deploy bem-sucedido:
- [ ] Configurar domínio personalizado
- [ ] Configurar analytics
- [ ] Monitorar performance
- [ ] Backup regular do banco

---

## 📞 **URLs Importantes Após Deploy**

- **Site**: `https://seu-site.netlify.app`
- **API Auth**: `https://seu-site.netlify.app/.netlify/functions/auth`
- **API Modules**: `https://seu-site.netlify.app/.netlify/functions/modules`
- **Dashboard**: `https://app.netlify.com/sites/seu-site`

---

**🚀 Seu projeto estará 100% funcional em produção!** 