
# Deploy Automático no Netlify

## Configuração do Deploy Automático

1. **Conecte seu repositório Git ao Netlify:**
   - No dashboard do Netlify, vá em "Site settings"
   - Em "Build & deploy" > "Continuous Deployment"
   - Conecte seu repositório GitHub/GitLab

2. **Configure as variáveis de ambiente no Netlify:**
   ```
   DATABASE_URL=sua_url_do_banco
   STUDENT_EMAIL=aluno@exemplo.com
   STUDENT_PASSWORD=123456
   ADMIN_EMAIL=admin@exemplo.com
   ADMIN_PASSWORD=admin123
   NODE_ENV=production
   ```

3. **Comandos de build já configurados no netlify.toml:**
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - Functions directory: `netlify/functions`

## Workflow de Deploy

1. Faça suas alterações no código
2. Commit e push para o repositório:
   ```bash
   git add .
   git commit -m "Suas alterações"
   git push origin main
   ```
3. O Netlify fará o deploy automaticamente

## Deploy Manual (Backup)

Se precisar fazer deploy manual:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --prod --dir=client/dist --functions=netlify/functions
```
