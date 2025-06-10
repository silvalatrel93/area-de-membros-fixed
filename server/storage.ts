import { users, modules, lessons, progress, type User, type InsertUser, type Module, type InsertModule, type Lesson, type InsertLesson, type Progress, type InsertProgress, type ModuleWithLessons, type LessonWithProgress } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Modules
  getModules(): Promise<ModuleWithLessons[]>;
  getModule(id: number): Promise<ModuleWithLessons | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: number): Promise<boolean>;

  // Lessons
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<LessonWithProgress | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: number): Promise<boolean>;

  // Progress
  getProgress(sessionId: string): Promise<Progress[]>;
  getModuleProgress(sessionId: string, moduleId: number): Promise<Progress[]>;
  getLessonProgress(sessionId: string, lessonId: number): Promise<Progress | undefined>;
  updateProgress(progressData: InsertProgress): Promise<Progress>;
  markLessonComplete(sessionId: string, lessonId: number, moduleId: number): Promise<Progress>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getModules(): Promise<ModuleWithLessons[]> {
    try {
      const modulesData = await db
        .select()
        .from(modules)
        .where(eq(modules.isActive, true))
        .orderBy(asc(modules.orderIndex));

      const modulesWithLessons: ModuleWithLessons[] = [];

      for (const module of modulesData) {
        const lessonsData = await db
          .select()
          .from(lessons)
          .where(and(eq(lessons.moduleId, module.id), eq(lessons.isActive, true)))
          .orderBy(asc(lessons.orderIndex));

        const lessonsWithProgress = await Promise.all(
          lessonsData.map(async (lesson) => {
            const [lessonProgress] = await db
              .select()
              .from(progress)
              .where(eq(progress.lessonId, lesson.id))
              .orderBy(desc(progress.lastWatchedAt))
              .limit(1);

            return {
              ...lesson,
              isCompleted: lessonProgress?.isCompleted || false,
              progress: lessonProgress
            };
          })
        );

        modulesWithLessons.push({
          ...module,
          lessons: lessonsWithProgress,
        });
      }

      return modulesWithLessons;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("Error fetching modules:", errorMessage);
      throw new Error(`Database error: ${errorMessage}`);
    }
  }

  async getModule(id: number): Promise<ModuleWithLessons | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    if (!module) return undefined;

    const lessonsData = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.moduleId, id), eq(lessons.isActive, true)))
      .orderBy(asc(lessons.orderIndex));

    return {
      ...module,
      lessons: lessonsData,
    };
  }

  async createModule(moduleData: InsertModule): Promise<Module> {
    try {
      const [module] = await db
        .insert(modules)
        .values(moduleData)
        .returning();
      return module;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("Error creating module:", errorMessage);
      throw new Error(`Failed to create module: ${errorMessage}`);
    }
  }

  async updateModule(id: number, moduleData: Partial<InsertModule>): Promise<Module | undefined> {
    const [module] = await db
      .update(modules)
      .set(moduleData)
      .where(eq(modules.id, id))
      .returning();
    return module || undefined;
  }

  async deleteModule(id: number): Promise<boolean> {
    const result = await db.delete(modules).where(eq(modules.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isActive, true)))
      .orderBy(asc(lessons.orderIndex));
  }

  async getLesson(id: number): Promise<LessonWithProgress | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(lessonData)
      .returning();
    return lesson;
  }

  async updateLesson(id: number, lessonData: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const [lesson] = await db
      .update(lessons)
      .set(lessonData)
      .where(eq(lessons.id, id))
      .returning();
    return lesson || undefined;
  }

  async deleteLesson(id: number): Promise<boolean> {
    const result = await db.delete(lessons).where(eq(lessons.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProgress(sessionId: string): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(eq(progress.sessionId, sessionId))
      .orderBy(desc(progress.lastWatchedAt));
  }

  async getModuleProgress(sessionId: string, moduleId: number): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(and(eq(progress.sessionId, sessionId), eq(progress.moduleId, moduleId)));
  }

  async getLessonProgress(sessionId: string, lessonId: number): Promise<Progress | undefined> {
    const [progressData] = await db
      .select()
      .from(progress)
      .where(and(eq(progress.sessionId, sessionId), eq(progress.lessonId, lessonId)));
    return progressData || undefined;
  }

  async updateProgress(progressData: InsertProgress): Promise<Progress> {
    const existing = await this.getLessonProgress(progressData.sessionId, progressData.lessonId);

    if (existing) {
      const [updated] = await db
        .update(progress)
        .set({
          progressPercentage: progressData.progressPercentage,
          isCompleted: progressData.isCompleted,
          lastWatchedAt: new Date(),
        })
        .where(and(
          eq(progress.sessionId, progressData.sessionId),
          eq(progress.lessonId, progressData.lessonId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(progress)
        .values({
          ...progressData,
          lastWatchedAt: new Date(),
        })
        .returning();
      return created;
    }
  }

  async markLessonComplete(sessionId: string, lessonId: number, moduleId: number): Promise<Progress> {
    return await this.updateProgress({
      sessionId,
      lessonId,
      moduleId,
      isCompleted: true,
      progressPercentage: 100,
    });
  }
}

export const storage = new DatabaseStorage();