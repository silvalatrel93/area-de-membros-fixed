import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/lib/auth";
import ModuleCarousel from "@/components/module-carousel";
import VideoPlayer from "@/components/video-player";
import LessonSidebar from "@/components/lesson-sidebar";
import LoadingOverlay from "@/components/loading-overlay";
import CompletionModal from "@/components/completion-modal";
import { Bell, LogOut, Settings } from "lucide-react";
import type { ModuleWithLessons, LessonWithProgress, Progress } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState<LessonWithProgress | null>(null);
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

  const handleLessonComplete = (lesson: LessonWithProgress) => {
    // Update current lesson as completed
    setCurrentLesson(prev => ({
      ...prev,
      isCompleted: true,
      progress: { ...prev.progress, isCompleted: true }
    }));

    const nextLesson = findNextLesson(lesson);

    if (nextLesson) {
      // Wait a bit to show the completion state, then move to next lesson
      setTimeout(() => {
        setCurrentLesson({
          ...nextLesson,
          progress: { isCompleted: false, progressPercentage: 0 },
          isCompleted: false
        });
      }, 1000);
    } else {
      setCompletedLesson({
        ...lesson,
        isCompleted: true,
        progress: { ...lesson.progress, isCompleted: true }
      });
      setShowCompletion(true);
    }
  };

  const findNextLesson = (currentLesson: LessonWithProgress) => {
    const currentModule = modulesList.find(m => m.id === currentLesson.moduleId);
    if (!currentModule) return null;

    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (currentIndex < currentModule.lessons.length - 1) {
      return currentModule.lessons[currentIndex + 1];
    }

    const moduleIndex = modulesList.findIndex(m => m.id === currentModule.id);
    if (moduleIndex < modulesList.length - 1) {
      const nextModule = modulesList[moduleIndex + 1];
      return nextModule.lessons[0] || null;
    }

    return null;
  };

  const handleLessonSelect = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson);
  };

  const handleNextLesson = () => {
    if (completedLesson) {
      const nextLesson = findNextLesson(completedLesson);
      if (nextLesson) {
        setCurrentLesson({
          ...nextLesson,
          progress: 0,
          isCompleted: false
        });
      }
    }
    setShowCompletion(false);
    setCompletedLesson(null);
  };

  if (modulesLoading) {
    return <LoadingOverlay />;
  }

  const modulesList = (modules as ModuleWithLessons[]) || [];
  const combinedProgress = (progressData as Progress[]) || [];

  const totalLessons = modulesList.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = combinedProgress.filter(p => p.isCompleted).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      <div className="device-optimized gradient-bg">
        {/* Navigation Header */}
        <nav className="sticky top-0 z-50 gradient-bg backdrop-blur-lg border-b border-netflix-red/20 shadow-2xl shadow-black/50">
          <div className="responsive-container">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <div className="flex items-center flex-1">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-netflix-text whitespace-nowrap">
                  <span className="text-netflix-red mr-2 text-xl md:text-2xl lg:text-3xl font-mono glitch-effect" data-text="</>">&lt;/&gt;</span>
                  <span className="text-base md:text-lg lg:text-xl">IA Revolution</span>
                </h1>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-netflix-text hover:text-netflix-red hover:bg-transparent p-2 md:p-3"
                >
                  <Bell size={16} className="md:hidden" />
                  <Bell size={20} className="hidden md:block" />
                </Button>
                {authService.isAdmin() && (
                  <Button
                    onClick={() => setLocation("/admin")}
                    variant="ghost"
                    size="sm"
                    className="text-netflix-red hover:text-white hover:bg-netflix-red p-2 md:p-3"
                  >
                    <Settings size={16} className="md:hidden" />
                    <Settings size={20} className="hidden md:block" />
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-netflix-text hover:text-netflix-red hover:bg-transparent p-2 md:p-3"
                >
                  <LogOut size={16} className="md:hidden" />
                  <LogOut size={20} className="hidden md:block" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 device-padding responsive-container">
          {!currentLesson ? (
            /* Module Selection */
            <div className="space-y-6 lg:space-y-8">
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-netflix-text mb-3 lg:mb-4">
                  Bem-vindo à <span className="text-netflix-red">IA Revolution</span>
                </h2>
                <p className="text-netflix-text-secondary text-sm md:text-base lg:text-lg mb-4 lg:mb-6">
                  Escolha um módulo para começar sua jornada.
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6 mb-6 lg:mb-8 max-w-2xl mx-auto">
                  <Card className="smooth-card">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center backdrop-blur-sm">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-netflix-red">{completedLessons}</div>
                      <div className="text-xs md:text-sm lg:text-base netflix-text-secondary whitespace-nowrap">Concluídas</div>
                    </CardContent>
                  </Card>
                  <Card className="smooth-card">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center backdrop-blur-sm">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-400">{modulesList.length}</div>
                      <div className="text-xs md:text-sm lg:text-base netflix-text-secondary whitespace-nowrap">Módulos</div>
                    </CardContent>
                  </Card>
                  <Card className="smooth-card">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center backdrop-blur-sm">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-400">{overallProgress}%</div>
                      <div className="text-xs md:text-sm lg:text-base netflix-text-secondary whitespace-nowrap">Progresso</div>
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
                <div className="text-center py-8 lg:py-12">
                  <p className="text-netflix-text-secondary text-sm md:text-base lg:text-lg">Nenhum módulo disponível no momento.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 h-full">
              <div className="flex-1 min-w-0 space-y-4">
                <div className="w-full aspect-video bg-black rounded-lg lg:rounded-xl overflow-hidden shadow-2xl">
                  <VideoPlayer
                    lesson={currentLesson}
                    onComplete={() => handleLessonComplete(currentLesson)}
                  />
                </div>

                {/* Lesson info card - visible on all devices */}
                <div className="w-full">
                  <Card className="smooth-card">
                    <CardContent className="p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-bold text-netflix-text mb-2">{currentLesson.title}</h3>
                      <p className="text-netflix-text-secondary text-sm lg:text-base mb-4">{currentLesson.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-netflix-text-secondary text-sm lg:text-base">Progresso da Aula</span>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base"
                          onClick={() => handleLessonComplete(currentLesson)}
                        >
                          ✓ Marcar como Concluída
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
                <LessonSidebar 
                  currentLesson={currentLesson}
                  modules={modulesList || []}
                  progress={combinedProgress || []}
                  onLessonSelect={handleLessonSelect}
                />
              </div>

              <div className="lg:hidden w-full mt-4">
                <LessonSidebar 
                  currentLesson={currentLesson}
                  modules={modulesList || []}
                  progress={combinedProgress || []}
                  onLessonSelect={handleLessonSelect}
                />
              </div>
            </div>
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