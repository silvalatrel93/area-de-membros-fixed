import { apiRequest } from "./queryClient";
import { authService } from "./auth";

export interface LessonProgress {
  lessonId: number;
  moduleId: number;
  isCompleted: boolean;
  progressPercentage: number;
  lastWatchedAt: string;
}

export const progressService = {
  async updateProgress(lessonId: number, moduleId: number, progressPercentage: number): Promise<void> {
    const sessionId = authService.getSessionId();
    if (!sessionId) return;

    await apiRequest("POST", "/api/progress", {
      sessionId,
      lessonId,
      moduleId,
      progressPercentage,
      isCompleted: progressPercentage >= 100,
    });
  },

  async markLessonComplete(lessonId: number, moduleId: number): Promise<void> {
    const sessionId = authService.getSessionId();
    if (!sessionId) return;

    await apiRequest("POST", `/api/progress/${sessionId}/lessons/${lessonId}/complete`, {
      moduleId,
    });
  },

  async getProgress(sessionId?: string): Promise<LessonProgress[]> {
    const currentSessionId = sessionId || authService.getSessionId();
    if (!currentSessionId) return [];

    const response = await apiRequest("GET", `/api/progress/${currentSessionId}`);
    return response.json();
  },

  async getModuleProgress(moduleId: number, sessionId?: string): Promise<LessonProgress[]> {
    const currentSessionId = sessionId || authService.getSessionId();
    if (!currentSessionId) return [];

    const response = await apiRequest("GET", `/api/progress/${currentSessionId}/modules/${moduleId}`);
    return response.json();
  },

  getLocalProgress(): Record<string, any> {
    const stored = localStorage.getItem("learnflix_progress");
    if (!stored) return {};
    
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  },

  saveLocalProgress(progress: Record<string, any>): void {
    localStorage.setItem("learnflix_progress", JSON.stringify(progress));
  },

  calculateModuleProgress(lessons: any[], progressData: LessonProgress[]): number {
    if (!lessons.length) return 0;

    const completedLessons = lessons.filter(lesson => 
      progressData.some(p => p.lessonId === lesson.id && p.isCompleted)
    );

    return Math.round((completedLessons.length / lessons.length) * 100);
  },
};
