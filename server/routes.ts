import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertModuleSchema, insertLessonSchema, insertProgressSchema } from "@shared/schema";
import { z } from "zod";
import { emailService, type SupportRequest } from "./email-service";
import { db } from './db';
import path from 'path';
import fs from 'fs/promises';

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to check credentials configuration
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

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Simple auth - check if credentials match expected values
      const validEmail = "aluno@aluno.com";
      const validPassword = "123456";
      const adminEmail = "admin@admin.com";
      const adminPassword = "admin123";

      console.log('Login attempt:', { 
        email, 
        password: password.length + ' chars',
        validEmail, 
        validPassword: validPassword.length + ' chars',
        adminEmail,
        adminPassword: adminPassword.length + ' chars'
      });

      let isAdmin = false;
      let isValid = false;

      if (email === validEmail && password === validPassword) {
        isValid = true;
        console.log('Student login successful');
      } else if (email === adminEmail && password === adminPassword) {
        isValid = true;
        isAdmin = true;
        console.log('Admin login successful');
      } else {
        console.log('Login failed - credentials do not match');
      }

      if (!isValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({ 
        success: true, 
        isAdmin,
        sessionId,
        message: "Login realizado com sucesso" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, "Senha atual é obrigatória"),
        newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
      });

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Verifica se a senha atual está correta
      const validEmail = process.env.STUDENT_EMAIL || "aluno@aluno.com";
      const validPassword = process.env.STUDENT_PASSWORD || "123456";
      const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      // Verifica se é um usuário válido
      let isValid = false;
      if (currentPassword === validPassword || currentPassword === adminPassword) {
        isValid = true;
      }

      if (!isValid) {
        return res.status(401).json({ message: "Senha atual incorreta" });
      }

      // Atualiza a senha no arquivo .env
      const envPath = path.join(process.cwd(), '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      // Atualiza a senha correspondente
      const newEnvContent = envContent
        .replace(`STUDENT_PASSWORD=${validPassword}`, `STUDENT_PASSWORD=${newPassword}`)
        .replace(`ADMIN_PASSWORD=${adminPassword}`, `ADMIN_PASSWORD=${newPassword}`);

      await fs.writeFile(envPath, newEnvContent);

      // Recarrega as variáveis de ambiente
      require('dotenv').config();

      res.json({ 
        success: true,
        message: "Senha alterada com sucesso" 
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ 
        message: "Erro ao alterar senha",
        error: error instanceof Error ? error.message : error
      });
    }
  });

  // Modules routes
  app.get("/api/modules", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ message: "SessionId é obrigatório" });
      }

      // Busca os módulos com o progresso do usuário
      const modules = await storage.getModules();
      const progress = await storage.getProgress(sessionId);

      // Adiciona o progresso a cada módulo
      const modulesWithProgress = modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          isCompleted: progress.some(p => p.lessonId === lesson.id && p.isCompleted),
          progress: progress.find(p => p.lessonId === lesson.id)
        }))
      }));

      res.json(modulesWithProgress);
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ 
        message: "Erro ao buscar módulos", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getModule(id);

      if (!module) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }

      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar módulo", error });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const moduleData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar módulo", error });
    }
  });

  app.put("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const moduleData = insertModuleSchema.partial().parse(req.body);
      const module = await storage.updateModule(id, moduleData);

      if (!module) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }

      res.json(module);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar módulo", error });
    }
  });

  app.delete("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteModule(id);

      if (!success) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }

      res.json({ message: "Módulo excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir módulo", error });
    }
  });

  // Lessons routes
  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const lessons = await storage.getLessonsByModule(moduleId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar aulas", error });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.getLesson(id);

      if (!lesson) {
        return res.status(404).json({ message: "Aula não encontrada" });
      }

      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar aula", error });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar aula", error });
    }
  });

  app.put("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lessonData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(id, lessonData);

      if (!lesson) {
        return res.status(404).json({ message: "Aula não encontrada" });
      }

      res.json(lesson);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar aula", error });
    }
  });

  app.delete("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLesson(id);

      if (!success) {
        return res.status(404).json({ message: "Aula não encontrada" });
      }

      res.json({ message: "Aula excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir aula", error });
    }
  });

  // Progress routes
  app.get("/api/progress", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ message: "SessionId é obrigatório" });
      }
      const progressData = await storage.getProgress(sessionId);
      res.json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar progresso", error });
    }
  });

  app.get("/api/progress/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const progressData = await storage.getProgress(sessionId);
      res.json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar progresso", error });
    }
  });

  app.get("/api/progress/:sessionId/modules/:moduleId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const moduleId = parseInt(req.params.moduleId);
      const progressData = await storage.getModuleProgress(sessionId, moduleId);
      res.json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar progresso do módulo", error });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.updateProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Progress update error:", error);
      res.status(400).json({ message: "Erro ao atualizar progresso", error: error instanceof Error ? error.message : error });
    }
  });

  app.post("/api/progress/:sessionId/lessons/:lessonId/complete", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const lessonId = parseInt(req.params.lessonId);
      const { moduleId } = z.object({ moduleId: z.number() }).parse(req.body);

      const progress = await storage.markLessonComplete(sessionId, lessonId, moduleId);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Erro ao marcar aula como concluída", error });
    }
  });

  // Support routes
  app.post("/api/support/request", async (req, res) => {
    try {
      const supportSchema = z.object({
        userEmail: z.string().email().optional(),
        lessonId: z.number(),
        moduleId: z.number(),
        message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
        sessionId: z.string().optional()
      });

      const { userEmail, lessonId, moduleId, message, sessionId: providedSessionId } = supportSchema.parse(req.body);

      // Gerar sessionId se não foi fornecido
      const sessionId = providedSessionId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Buscar informações da aula e módulo
      const lesson = await storage.getLesson(lessonId);
      const module = await storage.getModule(moduleId);

      if (!lesson || !module) {
        return res.status(404).json({ message: "Aula ou módulo não encontrado" });
      }

      const supportRequest: SupportRequest = {
        userEmail,
        lessonTitle: lesson.title,
        moduleTitle: module.title,
        message,
        timestamp: new Date(),
        sessionId
      };

      const emailSent = await emailService.sendSupportRequest(supportRequest);

      if (!emailSent) {
        return res.status(500).json({ 
          message: "Erro ao enviar solicitação de suporte. Tente novamente mais tarde." 
        });
      }

      res.json({ 
        success: true, 
        message: "Solicitação de suporte enviada com sucesso!" 
      });
    } catch (error) {
      console.error("Erro na solicitação de suporte:", error);
      res.status(400).json({ 
        message: "Erro ao processar solicitação de suporte", 
        error: error instanceof Error ? error.message : error 
      });
    }
  });

  app.get("/api/support/test-email", async (req, res) => {
    try {
      const isConnected = await emailService.testConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? "Conexão com email funcionando" : "Erro na conexão com email"
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao testar conexão de email", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}