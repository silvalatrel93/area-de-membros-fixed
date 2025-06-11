# 🚀 Deploy Manual - Área de Membros

## 📁 Arquivos Preparados
O build foi gerado com sucesso em: `client/dist/`

## 🌐 Deploy via Interface Web (RECOMENDADO)

### **1. Acesse o Netlify:**
- Vá para: https://app.netlify.com/
- Faça login ou crie uma conta gratuita

### **2. Prepare o arquivo ZIP:**
Você precisa compactar APENAS o conteúdo da pasta `client/dist/`:
- Abra: `C:\Users\Usuário\Downloads\Area-de-Menbro\Area-de-Menbro\client\dist\`
- Selecione TODOS os arquivos dentro desta pasta (index.html, assets/, etc.)
- Clique com botão direito → "Enviar para" → "Pasta compactada"
- Nome sugerido: `area-membros-build.zip`

### **3. Deploy no Netlify:**
1. No painel do Netlify, clique em **"Add new site"**
2. Selecione **"Deploy manually"**
3. Arraste o arquivo ZIP ou clique para fazer upload
4. Aguarde o deploy ser concluído

### **4. Configurar Variáveis de Ambiente:**
No painel do site no Netlify:
1. Vá em **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:YourPassword@ep-rough-darkness-a53vs4cr.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
PORT=8888
```

### **5. Configurar Redirects:**
O arquivo `_redirects` já está configurado em `public/_redirects`:
```
/* /index.html 200
/api/* /.netlify/functions/:splat 200
```

## 📱 URLs do Sistema

### **URLs Locais:**
- Frontend: http://localhost:5174
- Backend: http://localhost:5001

### **URLs de Produção (após deploy):**
- Site: https://[seu-site-netlify].netlify.app
- API: https://[seu-site-netlify].netlify.app/api

## 🔐 Credenciais de Acesso

### **Admin:**
- Email: admin@admin.com
- Senha: admin123

### **Aluno:**
- Email: aluno@aluno.com
- Senha: 123456

## 🔧 Estrutura de Deploy

### **Frontend (React):**
- Build: `client/dist/`
- Arquivos: index.html + assets/

### **Backend (Netlify Functions):**
- Funções: `netlify/functions/`
- Runtime: Node.js 18

### **Database:**
- Neon PostgreSQL (já configurado)
- Connection pooling ativo

## ⚠️ Checklist Pré-Deploy

- [x] Build gerado com sucesso
- [x] Netlify Functions configuradas
- [x] Database conectando
- [x] Variáveis de environment documentadas
- [x] Redirects configurados
- [x] Credenciais de teste prontas

## 🚨 Troubleshooting

### **Se o site não carregar:**
1. Verifique se fez upload apenas do conteúdo de `client/dist/`
2. Verifique se as variáveis de ambiente estão corretas
3. Veja os logs em: Site settings → Functions

### **Se a API não funcionar:**
1. Verifique as variáveis DATABASE_URL e JWT_SECRET
2. Teste a conexão com o banco
3. Verifique os logs das Netlify Functions

### **Se o login não funcionar:**
- Use as credenciais exatas listadas acima
- Verifique o console do navegador para erros
- Verifique se a DATABASE_URL está correta

## 🔄 Re-Deploy
Para atualizações futuras:
1. Execute `npm run build`
2. Compacte novamente o conteúdo de `client/dist/`
3. Faça novo upload no Netlify (Deploys → Drag and drop)

---

**Status:** ✅ Pronto para deploy manual! 