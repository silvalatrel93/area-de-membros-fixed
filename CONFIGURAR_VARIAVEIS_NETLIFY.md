# 🔧 Configurar Variáveis de Ambiente - Netlify

## ❌ **PROBLEMA ATUAL:**
- ✅ Site carrega (não mais branco)
- ❌ API retorna "Erro de conexão com servidor"
- ❌ Netlify Functions sem variáveis de ambiente

## 🎯 **SOLUÇÃO: Configurar Variáveis no Netlify**

### **1. 🌐 Acesse seu Site no Netlify:**
- URL: https://app.netlify.com/
- Vá para: **Sites** → **cute-fox-248e12** (seu site)

### **2. ⚙️ Configurar Variáveis:**
- Clique em: **Site settings** (configurações do site)
- No menu lateral: **Environment variables**
- Clique em: **Add a variable** → **Add variable**

### **3. 📝 Variáveis Obrigatórias:**

#### **DATABASE_URL**
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:YourPassword@ep-rough-darkness-a53vs4cr.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Scopes:** ✅ Functions (OBRIGATÓRIO)
- **Deploy contexts:** ✅ All (todos)

#### **JWT_SECRET**
- **Key:** `JWT_SECRET`
- **Value:** `your-super-secret-jwt-key-here-123456789`
- **Scopes:** ✅ Functions (OBRIGATÓRIO)
- **Deploy contexts:** ✅ All (todos)

#### **NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Scopes:** ✅ Functions + Builds
- **Deploy contexts:** ✅ All (todos)

#### **PORT**
- **Key:** `PORT`
- **Value:** `8888`
- **Scopes:** ✅ Functions
- **Deploy contexts:** ✅ All (todos)

### **4. 📋 Checklist de Configuração:**
- [ ] DATABASE_URL configurado com scope "Functions"
- [ ] JWT_SECRET configurado com scope "Functions"
- [ ] NODE_ENV = "production"
- [ ] PORT = "8888"
- [ ] Todas as variáveis com "All" contexts

### **5. 🚀 Trigger Novo Deploy:**
Após configurar as variáveis:
- Vá em: **Deploys**
- Clique em: **Trigger deploy** → **Deploy site**
- OU faça upload do ZIP novamente

### **6. 🧪 Testar após Deploy:**

#### **Teste 1: API Functions**
Abra no navegador:
```
https://cute-fox-248e12.netlify.app/.netlify/functions/auth
```
- ✅ Deve retornar JSON (não erro 404)
- ❌ Se retornar 404: Functions não deployadas

#### **Teste 2: Login**
No site:
- **Email:** admin@admin.com
- **Senha:** admin123
- ✅ Deve entrar no sistema
- ❌ Se erro: Verificar variáveis DATABASE_URL

## 🔍 **TROUBLESHOOTING:**

### **Se ainda não funcionar:**

#### **1. Verificar Logs:**
- **Site settings** → **Functions** → Ver logs
- Procurar por erros de "undefined" ou "missing"

#### **2. Verificar Scope:**
- Variáveis DEVEM ter scope "Functions" ✅
- Sem isso, as functions não acessam as variáveis

#### **3. Re-deploy:**
- Toda mudança de variável precisa de novo deploy
- **Deploys** → **Trigger deploy**

#### **4. Teste Local:**
```bash
# Localmente funciona?
npm run dev
```

### **Logs Esperados (Sucesso):**
```
✅ Functions loaded
✅ Database connected
✅ Auth endpoint ready
```

### **Logs de Erro (Problema):**
```
❌ DATABASE_URL is undefined
❌ Connection failed
❌ 500 Internal Server Error
```

## 🔧 **PASSOS DETALHADOS:**

### **Passo 1: Abra Site Settings**
1. https://app.netlify.com/sites/cute-fox-248e12/settings/env
2. Ou: Site → Settings → Environment variables

### **Passo 2: Adicionar Variável**
1. **Add a variable** → **Add variable**
2. **Key:** DATABASE_URL
3. **Value:** [sua connection string do Neon]
4. **Scopes:** ✅ Functions (CRÍTICO!)
5. **Deploy contexts:** All
6. **Save**

### **Passo 3: Repetir para Todas**
- JWT_SECRET
- NODE_ENV  
- PORT

### **Passo 4: Novo Deploy**
- **Deploys** → **Trigger deploy** → **Deploy site**

## ⏱️ **Tempo de Propagação:**
- Variáveis: Imediato após deploy
- Deploy: 1-3 minutos
- Total: ~5 minutos

---

## 🎯 **RESULTADO ESPERADO:**
✅ Login funcionando  
✅ "Acesso seguro e exclusivo" (verde)  
✅ API respondendo  
✅ Dashboard carregando  

**Status:** Pronto para configurar as variáveis! 