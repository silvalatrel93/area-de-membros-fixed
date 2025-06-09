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
import { Play, Home, Bookmark, TrendingUp, Search, Bell, LogOut } from "lucide-react";
import type { ModuleWithLessons, LessonWithProgress } from "@shared/schema";

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

  const handleLessonSelect = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson);
  };

  const handleLessonComplete = (lesson: LessonWithProgress) => {
    setCompletedLesson(lesson);
    setShowCompletion(true);
  };

  if (modulesLoading) {
    return <LoadingOverlay />;
  }

  const modulesList = modules as ModuleWithLessons[] || [];
  const progress = Array.isArray(progressData) ? progressData : [];

  // Calculate overall progress
  const totalLessons = modulesList.reduce((acc, module) => acc + module.lessons.length, 0);
  const progressArray = Array.isArray(progress) ? progress : [];
  const completedLessons = progressArray.filter(p => p.isCompleted).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      <div className="min-h-screen">
        {/* Navigation Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-netflix-dark/95 backdrop-blur-sm border-b border-netflix-light-gray/30">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-lg sm:text-xl font-bold text-netflix-text">
                  <Play className="inline text-netflix-red mr-1 sm:mr-2" size={20} />
                  <span className="hidden xs:inline">LearnFlix</span>
                  <span className="xs:hidden">LF</span>
                </h1>
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
                progress={progress}
                onLessonSelect={handleLessonSelect}
              />
            </div>
          </section>

          {/* Current Lesson Section */}
          {currentLesson && (
            <section className="py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-netflix-text mb-4 sm:mb-6">Aula Atual</h3>
                
                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <VideoPlayer 
                    lesson={currentLesson}
                    onComplete={() => handleLessonComplete(currentLesson)}
                  />
                  <LessonSidebar 
                    currentLesson={currentLesson}
                    modules={modulesList}
                    progress={progress}
                    onLessonSelect={handleLessonSelect}
                  />
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
        onNextLesson={() => {
          // Logic to find and play next lesson
          setShowCompletion(false);
        }}
      />
    </>
  );
}
