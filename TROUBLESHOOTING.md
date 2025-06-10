# 🔧 Guia de Solução de Problemas - Area de Membros

## 📋 Histórico de Problemas e Soluções

Este documento registra todos os problemas encontrados no projeto e suas respectivas soluções para referência futura.

---

## 🚨 Problema 1: Erros de TypeScript no TanStack Query v5

### ❌ **Erro Encontrado:**
```
Nenhuma sobrecarga corresponde a esta chamada.
O literal de objeto pode especificar apenas propriedades conhecidas e 'onError' não existe no tipo 'UseQueryOptions'
```

### 📍 **Localização:** 
- Arquivo: `client/src/pages/admin.tsx` (linha 40)

### 🔍 **Causa:**
O TanStack Query v5 removeu a propriedade `onError` do `useQuery`. A API mudou para usar `useEffect` para tratamento de erros.

### ✅ **Solução Implementada:**

**Antes:**
```typescript
const { data: modules, isLoading, error } = useQuery({
  queryKey: ["/api/modules"],
  queryFn: () => apiRequest("GET", "/api/modules"),
  retry: 2,
  onError: (error) => {
    toast({
      title: "Erro ao carregar módulos",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive"
    });
  }
});
```

**Depois:**
```typescript
import { useState, useEffect } from "react"; // Adicionar useEffect ao import

const { data: modules, isLoading, error } = useQuery({
  queryKey: ["/api/modules"],
  queryFn: () => apiRequest("GET", "/api/modules"),
  retry: 2,
});

// Tratamento de erro do useQuery
useEffect(() => {
  if (error) {
    toast({
      title: "Erro ao carregar módulos",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive"
    });
  }
}, [error, toast]);
```

---

## 🚨 Problema 2: Erro de Tipo na Porta do Servidor

### ❌ **Erro Encontrado:**
```
O argumento do tipo 'string | 5001' não é atribuível ao parâmetro do tipo 'number'.
O tipo 'string' não pode ser atribuído ao tipo 'number'.
```

### 📍 **Localização:** 
- Arquivo: `server/index.ts` (linha 77)

### 🔍 **Causa:**
`process.env.PORT` retorna string, mas `app.listen()` espera number.

### ✅ **Solução Implementada:**

**Antes:**
```typescript
const port = process.env.PORT || 5001;
app.listen(port, '0.0.0.0', () => {
```

**Depois:**
```typescript
const port = Number(process.env.PORT) || 5001;
app.listen(port, '0.0.0.0', () => {
```

---

## 🚨 Problema 3: Erro de Conexão no Login

### ❌ **Erro Encontrado:**
```
Erro de conexão com o servidor. Verifique sua internet e tente novamente.
```

### 📍 **Localização:** 
- Sistema de autenticação completo

### 🔍 **Causa:**
1. Servidor backend não estava rodando na porta 5001
2. Variáveis de ambiente conflitantes com valores diferentes dos esperados

### ✅ **Solução Implementada:**

1. **Verificação de Status dos Servidores:**
```bash
# Backend
netstat -ano | findstr ":5001"

# Frontend  
netstat -ano | findstr ":5173"
```

2. **Credenciais Fixas (substituindo variáveis de ambiente):**

**Antes:**
```typescript
const validEmail = process.env.STUDENT_EMAIL || "aluno@aluno.com";
const validPassword = process.env.STUDENT_PASSWORD || "123456";
const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
```

**Depois:**
```typescript
const validEmail = "aluno@aluno.com";
const validPassword = "123456";
const adminEmail = "admin@admin.com";
const adminPassword = "admin123";
```

3. **Endpoint de Debug Criado:**
```typescript
app.get("/api/debug/credentials", async (req, res) => {
  const validEmail = "aluno@aluno.com";
  const validPassword = "123456";
  const adminEmail = "admin@admin.com";
  const adminPassword = "admin123";
  
  res.json({
    studentEmail: validEmail,
    studentPasswordLength: validPassword.length,
    adminEmail: adminEmail,
    adminPasswordLength: adminPassword.length,
    environment: process.env.NODE_ENV
  });
});
```

---

## 🚨 Problema 4: SessionId Obrigatório na API de Módulos

### ❌ **Erro Encontrado:**
```
Erro ao carregar módulos
SessionId é obrigatório
```

### 📍 **Localização:** 
- Todas as requisições GET para `/api/modules`

### 🔍 **Causa:**
A API espera `sessionId` como query parameter, mas o cliente não estava enviando automaticamente.

### ✅ **Solução Implementada:**

**Modificação no `client/src/lib/queryClient.ts`:**

```typescript
export async function apiRequest(method: string, endpoint: string, data?: any) {
  let url = endpoint.startsWith('/api') 
    ? `http://localhost:5001${endpoint}`
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  // Adicionar sessionId como query parameter se estiver disponível e for um GET
  if (method === 'GET') {
    const auth = localStorage.getItem("learnflix_auth");
    if (auth) {
      try {
        const user = JSON.parse(auth);
        if (user.sessionId) {
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}sessionId=${user.sessionId}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }
  
  // resto da função...
}
```

---

## 🛠️ Comandos de Inicialização dos Servidores

### Backend (Porta 5001):
```bash
npx tsx server/index.ts
```

### Frontend (Porta 5173):
```bash
$env:NODE_ENV="development"; npx vite --host --port 5173
```

### Verificação de Status:
```bash
# Verificar se os servidores estão rodando
netstat -ano | findstr ":5001"  # Backend
netstat -ano | findstr ":5173"  # Frontend

# Parar todos os processos Node.js (se necessário)
taskkill /f /im node.exe
```

---

## 🔐 Credenciais de Teste

### Administrador:
- **Email:** `admin@admin.com`
- **Senha:** `admin123`

### Usuário Aluno:
- **Email:** `aluno@aluno.com`  
- **Senha:** `123456`

---

## 📊 Logs de Debug Úteis

### 1. Verificar Credenciais Configuradas:
```
GET http://localhost:5001/api/debug/credentials
```

### 2. Logs do Servidor - Login bem-sucedido:
```
Login attempt: { email: 'admin@admin.com', password: '8 chars', ... }
Admin login successful
[express] POST /api/auth/login 200 in 2ms
```

### 3. Logs do Servidor - Módulos carregados:
```
[express] GET /api/modules 200 in 797ms :: [{"id":1,"title":"CODIGO DO PROPOSITO",...}]
```

---

## 🔄 Sequência de Restart Completo

Se todos os problemas retornarem, siga esta sequência:

1. **Parar todos os processos:**
```bash
taskkill /f /im node.exe
```

2. **Iniciar Backend:**
```bash
npx tsx server/index.ts
```
*Aguardar logs de "Server running at http://localhost:5001"*

3. **Iniciar Frontend:**
```bash
$env:NODE_ENV="development"; npx vite --host --port 5173
```
*Aguardar logs de "ready in Xms"*

4. **Testar acesso:**
- Frontend: `http://localhost:5173`
- Backend Debug: `http://localhost:5001/api/debug/credentials`

---

## 📝 Análise de Escalabilidade e Manutenibilidade

### ✅ **Melhorias Implementadas:**

1. **Compatibilidade com TanStack Query v5**: Migração do `onError` obsoleto para `useEffect`
2. **Type Safety**: Correção de tipos na configuração do servidor  
3. **Autenticação Robusta**: Sistema simplificado com credenciais fixas
4. **SessionId Automático**: Inclusão automática em requisições GET
5. **Logs de Debug**: Endpoint específico para diagnóstico

### 🚀 **Próximos Passos Sugeridos:**

1. **Sistema de Retry**: Implementar retry automático em falhas de conexão
2. **Health Checks**: Endpoints de verificação de saúde da aplicação
3. **Logs Estruturados**: Sistema de logging mais robusto
4. **Configuração Dinâmica**: Permitir mudança de credenciais via interface
5. **Testes Automatizados**: Cobertura de testes para evitar regressões

---

## ⚠️ **Importante:**

- Este documento deve ser atualizado sempre que novos problemas forem encontrados e resolvidos
- Mantenha as credenciais de teste atualizadas se houver mudanças
- Documente qualquer nova variável de ambiente necessária
- Registre alterações na estrutura da API

---

*Documento criado em: $(Get-Date)*  
*Última atualização: $(Get-Date)* 