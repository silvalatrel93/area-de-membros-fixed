
# Configuração do Sistema de Email para Suporte

Este documento explica como configurar o serviço de email para o sistema de suporte da plataforma.

## Configuração com Gmail

### 1. Ativar Autenticação de Dois Fatores

1. Acesse sua conta Google
2. Vá em **Segurança** > **Verificação em duas etapas**
3. Ative a verificação em duas etapas

### 2. Gerar Senha de App

1. Na seção **Segurança**, clique em **Senhas de app**
2. Selecione **Email** como aplicativo
3. Selecione **Outro (nome personalizado)** como dispositivo
4. Digite um nome como "Plataforma Cursos"
5. Copie a senha gerada (16 caracteres)

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Email Configuration for Support
SUPPORT_EMAIL=seu-email@gmail.com
SUPPORT_EMAIL_PASSWORD=sua-senha-de-app-aqui
SUPPORT_TEAM_EMAIL=suporte@suaempresa.com
```

## Configuração com Outros Provedores

### Outlook/Hotmail

```env
SUPPORT_EMAIL=seu-email@outlook.com
SUPPORT_EMAIL_PASSWORD=sua-senha
SUPPORT_TEAM_EMAIL=suporte@suaempresa.com
```

Modifique o arquivo `server/email-service.ts`:

```typescript
this.transporter = nodemailer.createTransporter({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SUPPORT_EMAIL_PASSWORD
  }
});
```

### Provedores Personalizados (SMTP)

```typescript
this.transporter = nodemailer.createTransporter({
  host: 'seu-servidor-smtp.com',
  port: 587,
  secure: false, // true para port 465, false para outras portas
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SUPPORT_EMAIL_PASSWORD
  }
});
```

## Testando a Configuração

1. Configure as variáveis de ambiente
2. Reinicie o servidor
3. Acesse o painel administrativo
4. Clique no botão **"Testar Email"**
5. Verifique se aparece "Email OK"

## Funcionalidades

### Para Alunos
- Envio de dúvidas sobre aulas específicas
- Email de confirmação automático (opcional)
- Informações da aula e módulo incluídas automaticamente

### Para Equipe de Suporte
- Emails organizados com informações da aula
- Dados do aluno e sessão para contexto
- Template profissional de email

## Personalizações

### Modificar Templates de Email

Edite os templates HTML nos métodos:
- `sendSupportRequest()` - Email para equipe de suporte
- `sendConfirmationEmail()` - Email de confirmação para aluno

### Adicionar Anexos

```typescript
const mailOptions = {
  // ... outras opções
  attachments: [
    {
      filename: 'manual.pdf',
      path: '/caminho/para/arquivo.pdf'
    }
  ]
};
```

### Integração com Sistemas de Tickets

Para integrar com sistemas como Zendesk, Freshdesk, etc., modifique o método `sendSupportRequest()` para fazer chamadas API adicionais.

## Monitoramento

- Logs de erro aparecem no console do servidor
- Status de conexão disponível no painel admin
- Emails de teste podem ser enviados pelo painel

## Solução de Problemas

### "Authentication failed"
- Verifique se a senha de app está correta
- Confirme que a autenticação de dois fatores está ativa

### "Connection timeout"
- Verifique a conexão com internet
- Teste com diferentes portas (587, 465)

### Emails não chegam
- Verifique pasta de spam
- Confirme se o email de destino está correto
- Teste com diferentes provedores de email
