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
        <nav className="fixed top-0 left-0 right-0 z-50 gradient-bg backdrop-blur-lg border-b border-netflix-red/20 shadow-2xl shadow-black/50">
          <div className="px-4 max-w-md mx-auto">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center flex-1">
                <h1 className="text-lg font-bold text-netflix-text whitespace-nowrap">
                  <span className="text-netflix-red mr-2 text-xl font-mono glitch-effect" data-text="</>">&lt;/&gt;</span>
                  <span className="responsive-text">IA Revolution</span>
                </h1>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-netflix-text hover:text-netflix-red hover:bg-transparent p-2"
                >
                  <Bell size={16} />
                </Button>
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
                  className="bg-netflix-red hover:bg-red-700 text-white p-2"
                  size="sm"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-16 gradient-bg min-h-screen">
          {/* Mobile-optimized content */}
          <div className="px-4 py-6 max-w-md mx-auto">
            {!currentLesson ? (
              /* Module Selection */
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-netflix-text mb-3">
                    Bem-vindo à <span className="text-netflix-red">IA Revolution</span>
                  </h2>
                  <p className="text-netflix-text-secondary text-sm mb-4">
                    Escolha um módulo para começar sua jornada.
                  </p>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <Card className="smooth-card">
                      <CardContent className="p-3 text-center">
                        <div className="text-lg font-bold text-netflix-red">{completedLessons}</div>
                        <div className="text-xs netflix-text-secondary whitespace-nowrap">Concluídas</div>
                      </CardContent>
                    </Card>
                    <Card className="smooth-card">
                      <CardContent className="p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">{modulesList.length}</div>
                        <div className="text-xs netflix-text-secondary whitespace-nowrap">Módulos</div>
                      </CardContent>
                    </Card>
                    <Card className="smooth-card">
                      <CardContent className="p-3 text-center">
                        <div className="text-lg font-bold text-green-400">{overallProgress}%</div>
                        <div className="text-xs netflix-text-secondary whitespace-nowrap">Progresso</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {modulesList && modulesList.length > 0 ? (
                  <ModuleCarousel 
                    modules={modulesList} 
                    progress={combinedProgress || []} 
                    onLessonSelect={handleLessonSelect}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-netflix-text-secondary text-sm">Nenhum módulo disponível no momento.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Lesson View - Mobile Stack */
              <div className="space-y-4">
                {/* Video Player */}
                <div className="w-full">
                  <VideoPlayer
                    lesson={currentLesson}
                    onComplete={() => handleLessonComplete(currentLesson)}
                  />
                </div>
                
                {/* Lesson Sidebar - Mobile Bottom */}
                <div className="w-full">
                  <LessonSidebar 
                    currentLesson={currentLesson}
                    modules={modulesList || []}
                    progress={combinedProgress || []}
                    onLessonSelect={handleLessonSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

          {/* Course Modules Carousel */}
          <section className="relative py-8 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black/50 to-red-950/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 via-transparent to-red-900/5"></div>
            <div className="relative max-w-7xl mx-auto">
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