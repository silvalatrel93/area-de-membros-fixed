import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/lib/auth";
import { progressService } from "@/lib/progress";
import ModuleCarousel from "@/components/module-carousel";
import VideoPlayer from "@/components/video-player";
import LessonSidebar from "@/components/lesson-sidebar";
import LoadingOverlay from "@/components/loading-overlay";
import CompletionModal from "@/components/completion-modal";
import { BrainLogo } from "@/components/brain-logo";
import { Home, Bookmark, TrendingUp, Search, Bell, LogOut } from "lucide-react";
import type { ModuleWithLessons, LessonWithProgress } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState<LessonWithProgress | null>(null);
  const [localCompletedLessons, setLocalCompletedLessons] = useState<Set<number>>(new Set());
  const sessionId = authService.getSessionId();

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/modules"],
    enabled: !!sessionId,
  });

  const { data: progressData } = useQuery({
    queryKey: ["/api/progress", sessionId],
    enabled: !!sessionId,
  });

  const handleLogout = () => {
    authService.logout();
    setLocation("/login");
  };

  const handleLessonComplete = async (lesson: LessonWithProgress) => {
    console.log("Lesson completed:", lesson);

    // Marcar como concluída localmente primeiro
    setLocalCompletedLessons(prev => new Set([...prev, lesson.id]));

    // Tentar marcar no servidor
    try {
      if (sessionId) {
        await progressService.markLessonComplete(lesson.id, lesson.moduleId);
        console.log("Lesson marked complete successfully");
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      // Manter marcação local mesmo se falhar no servidor
    }

    // Encontrar próxima aula
    const nextLesson = findNextLesson(lesson);
    console.log("Finding next lesson for:", lesson);

    if (nextLesson) {
      console.log("Next lesson found:", nextLesson);
      setCurrentLesson({
        ...nextLesson,
        progress: 0,
        isCompleted: false
      });
      console.log("Setting new current lesson:", {
        ...nextLesson,
        progress: 0,
        isCompleted: false
      });
    } else {
      // Última aula do curso concluída
      setCompletedLesson(lesson);
      setShowCompletion(true);
    }
  };

  const findNextLesson = (currentLesson: LessonWithProgress) => {
    console.log("Finding next lesson for:", currentLesson);
    const currentModule = modulesList.find(m => m.id === currentLesson.moduleId);
    if (!currentModule) {
      console.log("Current module not found");
      return null;
    }

    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
    console.log("Current lesson index:", currentIndex);

    // Check if there's a next lesson in the same module
    if (currentIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentIndex + 1];
      console.log("Found next lesson in same module:", nextLesson);
      return nextLesson;
    }

    // Check if there's a next module
    const moduleIndex = modulesList.findIndex(m => m.id === currentModule.id);
    console.log("Current module index:", moduleIndex);
    if (moduleIndex < modulesList.length - 1) {
      const nextModule = modulesList[moduleIndex + 1];
      const nextLesson = nextModule.lessons[0];
      console.log("Found next lesson in next module:", nextLesson);
      return nextLesson;
    }

    console.log("No next lesson found");
    return null;
  };

  const handleNextLesson = () => {
    console.log("Handle next lesson called");
    if (!completedLesson) {
      console.log("No completed lesson");
      return;
    }

    const nextLesson = findNextLesson(completedLesson);
    console.log("Next lesson found:", nextLesson);

    if (nextLesson) {
      const lessonWithProgress: LessonWithProgress = {
        ...nextLesson,
        progress: progressData?.find(p => p.lessonId === nextLesson.id)?.progressPercentage || 0,
        isCompleted: progressData?.some(p => p.lessonId === nextLesson.id && p.isCompleted) || false,
        moduleId: nextLesson.moduleId
      };
      console.log("Setting new current lesson:", lessonWithProgress);
      setCurrentLesson(lessonWithProgress);
      setShowCompletion(false);
    } else {
      console.log("No next lesson available");
    }
  };

  const handleLessonSelect = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson);
  };

  // Combinar progresso do servidor com progresso local
  const getCombinedProgress = () => {
    const serverProgress = Array.isArray(progressData) ? progressData : [];
    const combinedProgress = [...serverProgress];

    // Adicionar aulas concluídas localmente que ainda não estão no servidor
    localCompletedLessons.forEach(lessonId => {
      const existingProgress = combinedProgress.find(p => p.lessonId === lessonId);
      if (!existingProgress || !existingProgress.isCompleted) {
        if (existingProgress) {
          existingProgress.isCompleted = true;
          existingProgress.progressPercentage = 100;
        } else {
          const lesson = modulesList.flatMap(m => m.lessons).find(l => l.id === lessonId);
          if (lesson) {
            combinedProgress.push({
              id: 0, // Temporário
              sessionId: sessionId || '',
              lessonId: lessonId,
              moduleId: lesson.moduleId,
              isCompleted: true,
              progressPercentage: 100,
              lastWatchedAt: new Date()
            });
          }
        }
      }
    });

    return combinedProgress;
  };


  if (modulesLoading) {
    return <LoadingOverlay />;
  }

  const modulesList = modules as ModuleWithLessons[] || [];
  const combinedProgress = getCombinedProgress();

  // Calculate overall progress
  const totalLessons = modulesList.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = combinedProgress.filter(p => p.isCompleted).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      <div className="min-h-screen">
        {/* Navigation Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-netflix-dark/95 backdrop-blur-sm border-b border-netflix-light-gray/30">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <BrainLogo size={32} className="text-netflix-red animate-bounce" />
                <h1 className="text-lg font-bold text-netflix-text hidden sm:block">IA Revolution</h1>
              </div>

              {/* Navigation Links - Hidden on mobile */}
              <div className="hidden lg:block">
                <div className="ml-10 flex items-baseline space-x-6">
                  <a href="#" className="text-netflix-text hover:text-netflix-red transition-colors duration-200 px-3 py-2 text-sm font-medium">
                    <Home className="inline mr-1" size={16} /> Início
                  </a>
                  <a href="#" className="netflix-text-secondary hover:text-netflix-red transition-colors duration-200 px-3 py-2 text-sm font-medium">
                    <Bookmark className="inline mr-1" size={16} /> Cursos
                  </a>
                  <a href="#" className="netflix-text-secondary hover:text-netflix-red transition-colors duration-200 px-3 py-2 text-sm font-medium">
                    <TrendingUp className="inline mr-1" size={16} /> Progresso
                  </a>
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button className="netflix-text-secondary hover:text-netflix-text transition-colors duration-200 p-2">
                  <Search size={18} />
                </button>
                <button className="netflix-text-secondary hover:text-netflix-text transition-colors duration-200 p-2">
                  <Bell size={18} />
                </button>
                {authService.isAdmin() && (
                  <Button
                    onClick={() => setLocation("/admin")}
                    variant="outline"
                    size="sm"
                    className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white hidden sm:flex"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  className="bg-netflix-red hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  <LogOut className="mr-1" size={14} />
                  <span className="hidden sm:inline">Sair</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-14 sm:pt-16">
          {/* Welcome Hero Section */}
          <section className="relative py-6 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-dark via-netflix-gray/50 to-netflix-dark opacity-80"></div>
            <div className="relative max-w-7xl mx-auto">
              <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
                <div className="lg:flex-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-netflix-text mb-3 sm:mb-4">
                    Bem-vindo de volta! 👋
                  </h2>
                  <p className="text-base sm:text-lg netflix-text-secondary mb-4 sm:mb-6 max-w-2xl">
                    Continue sua jornada de aprendizado. Você está progredindo muito bem!
                  </p>
                  <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
                    <Card className="bg-netflix-red/10 border-netflix-red/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-2xl font-bold text-netflix-red">{completedLessons}</div>
                        <div className="text-xs sm:text-sm netflix-text-secondary">Aulas Concluídas</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-2xl font-bold text-blue-400">{modulesList.length}</div>
                        <div className="text-xs sm:text-sm netflix-text-secondary">Módulos Ativos</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-2xl font-bold text-green-400">{overallProgress}%</div>
                        <div className="text-xs sm:text-sm netflix-text-secondary">Progresso Total</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Course Modules Carousel */}
          <section className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <ModuleCarousel 
                modules={modulesList} 
                progress={combinedProgress}
                onLessonSelect={handleLessonSelect}
              />
            </div>
          </section>

          {/* Current Lesson Section */}
          {currentLesson && (
            <section className="py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-netflix-text mb-4 sm:mb-6">Aula Atual</h3>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <div className="order-1 lg:col-span-2">
                    <VideoPlayer 
                      lesson={currentLesson}
                      onComplete={() => handleLessonComplete(currentLesson)}
                    />
                  </div>
                  <div className="order-2 lg:order-1 lg:col-span-1">
                    <LessonSidebar 
                      currentLesson={currentLesson}
                      modules={modulesList}
                      progress={combinedProgress}
                      onLessonSelect={handleLessonSelect}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        lesson={completedLesson}
        onNextLesson={handleNextLesson}
        hasNextLesson={completedLesson ? !!findNextLesson(completedLesson) : false}
      />
    </>
  );
}