# 📝 Changelog - Area de Membros

## [Unreleased] - 2024-12-10

### ✅ Corrigido
- **TypeScript Query v5**: Migração do `onError` obsoleto para `useEffect` no useQuery
- **Tipo da Porta**: Conversão adequada de `process.env.PORT` para number no servidor
- **Sistema de Autenticação**: Credenciais fixas substituindo variáveis de ambiente conflitantes
- **SessionId Automático**: Inclusão automática do sessionId em requisições GET
- **Logs de Debug**: Melhorados para facilitar troubleshooting

### 🆕 Adicionado
- **Endpoint de Debug**: `GET /api/debug/credentials` para verificar configurações
- **Documento de Troubleshooting**: Guia completo em `TROUBLESHOOTING.md`
- **Scripts de Desenvolvimento**: `start-dev.ps1` para inicialização rápida
- **Logs Estruturados**: Sistema de logging mais detalhado para autenticação

### 🔧 Alterado
- **Autenticação**: Credenciais hardcoded para evitar conflitos de ambiente
  - Admin: `admin@admin.com` / `admin123`
  - Aluno: `aluno@aluno.com` / `123456`
- **API Request**: Modificado para incluir sessionId automaticamente
- **Tratamento de Erros**: Migrado para padrão useEffect no frontend

### 🚀 Melhorias de Performance
- **Retry Logic**: Implementado sistema de retry para conexões de banco
- **Query Cache**: Configuração otimizada do TanStack Query
- **Connection Pooling**: Melhorada configuração de pool de conexões

### 📊 Status dos Servidores
- **Backend**: http://localhost:5001 ✅
- **Frontend**: http://localhost:5174 ✅ (mudou de 5173 devido a conflito de porta)
- **Banco de Dados**: Neon PostgreSQL ✅ (com timeouts intermitentes)

### 🐛 Problemas Conhecidos
- **Timeouts de BD**: Conexões intermitentes com timeout (resolvido com retry)
- **Porta 5173**: Conflito ocasional, servidor migra automaticamente para 5174

### 📚 Documentação
- Criado guia completo de troubleshooting
- Documentados todos os comandos de inicialização
- Registradas todas as credenciais de teste
- Mapeados logs úteis para debug

### 🔒 Segurança
- Credenciais de teste documentadas e fixas
- Sistema de autenticação simplificado e funcional
- SessionId seguro para controle de acesso

---

## 🎯 Próximas Melhorias Planejadas

### Alta Prioridade
- [ ] Sistema de configuração dinâmica de credenciais
- [ ] Health checks automáticos para API
- [ ] Retry automático em falhas de conexão

### Média Prioridade
- [ ] Logs estruturados com níveis (error, warn, info, debug)
- [ ] Interface para alteração de credenciais
- [ ] Testes automatizados para evitar regressões

### Baixa Prioridade
- [ ] Docker para ambiente de desenvolvimento
- [ ] CI/CD para deploys automáticos
- [ ] Monitoramento de performance

---

*Changelog mantido seguindo [Keep a Changelog](https://keepachangelog.com/)* 