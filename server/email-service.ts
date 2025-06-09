
import nodemailer from 'nodemailer';

interface SupportRequest {
  userEmail?: string;
  lessonTitle: string;
  moduleTitle: string;
  message: string;
  timestamp: Date;
  sessionId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração para Gmail (pode ser adaptada para outros provedores)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_EMAIL_PASSWORD // Use App Password para Gmail
      }
    });
  }

  async sendSupportRequest(request: SupportRequest): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SUPPORT_EMAIL,
        to: process.env.SUPPORT_TEAM_EMAIL || process.env.SUPPORT_EMAIL,
        subject: `[SUPORTE] Dúvida sobre: ${request.lessonTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e50914; border-bottom: 2px solid #e50914; padding-bottom: 10px;">
              Nova Solicitação de Suporte
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Detalhes da Aula</h3>
              <p><strong>Módulo:</strong> ${request.moduleTitle}</p>
              <p><strong>Aula:</strong> ${request.lessonTitle}</p>
              <p><strong>Data/Hora:</strong> ${request.timestamp.toLocaleString('pt-BR')}</p>
              <p><strong>ID da Sessão:</strong> ${request.sessionId}</p>
              ${request.userEmail ? `<p><strong>Email do Usuário:</strong> ${request.userEmail}</p>` : ''}
            </div>

            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #333;">Mensagem do Aluno</h3>
              <p style="line-height: 1.6; color: #555;">${request.message.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Esta mensagem foi enviada automaticamente pelo sistema de suporte da plataforma de cursos.
                Para responder, utilize o email ${request.userEmail || 'disponível no sistema'}.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      
      // Se o usuário forneceu email, enviar confirmação
      if (request.userEmail) {
        await this.sendConfirmationEmail(request);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de suporte:', error);
      return false;
    }
  }

  private async sendConfirmationEmail(request: SupportRequest): Promise<void> {
    try {
      const confirmationOptions = {
        from: process.env.SUPPORT_EMAIL,
        to: request.userEmail,
        subject: 'Confirmação - Sua dúvida foi recebida',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e50914; border-bottom: 2px solid #e50914; padding-bottom: 10px;">
              Dúvida Recebida com Sucesso
            </h2>
            
            <p>Olá!</p>
            
            <p>Recebemos sua dúvida sobre a aula <strong>"${request.lessonTitle}"</strong> do módulo <strong>"${request.moduleTitle}"</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Sua mensagem:</h3>
              <p style="font-style: italic; color: #555;">"${request.message}"</p>
            </div>

            <p>Nossa equipe de suporte analisará sua dúvida e responderá em breve. O tempo médio de resposta é de 24-48 horas em dias úteis.</p>
            
            <p style="margin-top: 30px;">
              <strong>Atenciosamente,</strong><br>
              Equipe de Suporte
            </p>

            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 12px; color: #856404;">
                <strong>Dica:</strong> Para dúvidas urgentes, você também pode continuar assistindo às próximas aulas, pois muitas dúvidas são esclarecidas ao longo do curso.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(confirmationOptions);
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na conexão com o serviço de email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export type { SupportRequest };
