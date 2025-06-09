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
import { Bell, LogOut } from "lucide-react";
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

  const handleLessonComplete = async (lesson: LessonWithProgress) => {
    const nextLesson = findNextLesson(lesson);
    
    if (nextLesson) {
      setCurrentLesson({
        ...nextLesson,
        progress: 0,
        isCompleted: false
      });
    } else {
      setCompletedLesson(lesson);
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
      <div className="mobile-optimized gradient-bg">
        {/* Navigation Header */}
        <nav className="sticky top-0 z-50 gradient-bg backdrop-blur-lg border-b border-netflix-red/20 shadow-2xl shadow-black/50">
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
                {authService.isAdmin() && (
                  <Button
                    onClick={() => setLocation("/admin")}
                    variant="outline"
                    size="sm"
                    className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white text-xs px-2 py-1 whitespace-nowrap"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-netflix-text hover:text-netflix-red hover:bg-transparent p-2"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 max-w-md mx-auto">
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
                    <CardContent className="p-3 text-center backdrop-blur-sm">
                      <div className="text-lg font-bold text-netflix-red">{completedLessons}</div>
                      <div className="text-xs netflix-text-secondary whitespace-nowrap">Concluídas</div>
                    </CardContent>
                  </Card>
                  <Card className="smooth-card">
                    <CardContent className="p-3 text-center backdrop-blur-sm">
                      <div className="text-lg font-bold text-blue-400">{modulesList.length}</div>
                      <div className="text-xs netflix-text-secondary whitespace-nowrap">Módulos</div>
                    </CardContent>
                  </Card>
                  <Card className="smooth-card">
                    <CardContent className="p-3 text-center backdrop-blur-sm">
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