import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertModuleSchema, insertLessonSchema, insertProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Simple auth - check if credentials match expected values
      const validEmail = process.env.STUDENT_EMAIL || "aluno@exemplo.com";
      const validPassword = process.env.STUDENT_PASSWORD || "123456";
      const adminEmail = process.env.ADMIN_EMAIL || "admin@exemplo.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      let isAdmin = false;
      let isValid = false;
      
      if (email === validEmail && password === validPassword) {
        isValid = true;
      } else if (email === adminEmail && password === adminPassword) {
        isValid = true;
        isAdmin = true;
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
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  // Modules routes
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar módulos", error });
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

  const httpServer = createServer(app);
  return httpServer;
}
