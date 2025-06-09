import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { progressService } from "@/lib/progress";
import { ChevronLeft, ChevronRight, Play, Lock } from "lucide-react";
import MatrixCodeEffect from "@/components/matrix-code-effect";
import type { ModuleWithLessons, Progress as ProgressType, LessonWithProgress } from "@shared/schema";

interface ModuleCarouselProps {
  modules: ModuleWithLessons[];
  progress: ProgressType[];
  onLessonSelect: (lesson: LessonWithProgress) => void;
}

export default function ModuleCarousel({ modules, progress, onLessonSelect }: ModuleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getModuleProgress = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    // Convert progress data to match expected interface
    const progressData = progress.map(p => ({
      lessonId: p.lessonId,
      moduleId: p.moduleId,
      isCompleted: p.isCompleted,
      progressPercentage: p.progressPercentage,
      lastWatchedAt: p.lastWatchedAt instanceof Date ? p.lastWatchedAt.toISOString() : p.lastWatchedAt
    }));
    
    return progressService.calculateModuleProgress(module.lessons, progressData);
  };

  const isModuleUnlocked = (moduleIndex: number) => {
    if (moduleIndex === 0) return true;
    
    const previousModule = modules[moduleIndex - 1];
    const previousProgress = getModuleProgress(previousModule.id);
    return previousProgress >= 100;
  };

  const getCurrentLesson = (module: ModuleWithLessons) => {
    const moduleProgress = progress.filter(p => p.moduleId === module.id);
    const incompleteLessons = module.lessons.filter(lesson => 
      !moduleProgress.some(p => p.lessonId === lesson.id && p.isCompleted)
    );
    
    return incompleteLessons[0] || module.lessons[0];
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Largura do card + espaçamento
      scrollContainerRef.current.scrollBy({ 
        left: -cardWidth, 
        behavior: 'smooth' 
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      scrollContainerRef.current.scrollBy({ 
        left: cardWidth, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold ml-[31px] mr-[31px] text-[#ffffff]">Módulos do Curso</h3>
        <div className="hidden sm:flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            className="p-2 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            className="p-2 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      {/* Horizontal Scroll Container */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 sm:space-x-4 ml-[20px] mr-[20px] pl-[0px] pr-[0px] pt-[19px] pb-[19px] mt-[8px] mb-[8px]" style={{ width: "max-content" }}>
          {modules.map((module, index) => {
            const moduleProgress = getModuleProgress(module.id);
            const isUnlocked = isModuleUnlocked(index);
            const currentLesson = getCurrentLesson(module);
            
            return (
              <Card 
                key={module.id}
                className="rounded-lg text-card-foreground shadow-sm flex-none w-72 sm:w-80 bg-netflix-gray hover:scale-105 transition-transform duration-300 border relative overflow-hidden border-netflix-light-gray/30 ml-[9px] mr-[9px]"
              >
                {/* Matrix Code Effect Background */}
                <MatrixCodeEffect speed={80} className="absolute inset-0 opacity-15" />
                {module.imageUrl && (
                  <div className="relative">
                    <img 
                      src={module.imageUrl}
                      alt={module.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-netflix-gray via-transparent to-transparent"></div>
                  </div>
                )}
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      !isUnlocked 
                        ? "bg-netflix-text-secondary text-netflix-dark"
                        : moduleProgress > 0 && moduleProgress < 100
                        ? "bg-netflix-red text-white"
                        : moduleProgress >= 100
                        ? "bg-green-500 text-white"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {!isUnlocked ? "BLOQUEADO" : 
                       moduleProgress >= 100 ? "CONCLUÍDO" :
                       moduleProgress > 0 ? "EM ANDAMENTO" : "DISPONÍVEL"}
                    </span>
                    <span className="netflix-text-secondary text-sm">{module.lessons.length} aulas</span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-netflix-text mb-2">{module.title}</h4>
                  <p className="netflix-text-secondary text-sm mb-4 line-clamp-2">{module.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="netflix-text-secondary">Progresso</span>
                      <span className={`font-medium ${moduleProgress > 0 ? 'text-netflix-red' : 'netflix-text-secondary'}`}>
                        {moduleProgress}%
                      </span>
                    </div>
                    <Progress value={moduleProgress} className="h-2" />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (isUnlocked) {
                        const lessonWithProgress: LessonWithProgress = {
                          ...currentLesson,
                          progress: progress.find(p => p.lessonId === currentLesson.id)?.progressPercentage || 0,
                          isCompleted: progress.some(p => p.lessonId === currentLesson.id && p.isCompleted) || false
                        };
                        onLessonSelect(lessonWithProgress);
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 font-medium ${
                      !isUnlocked 
                        ? "bg-netflix-light-gray text-netflix-text-secondary cursor-not-allowed"
                        : "bg-netflix-red hover:bg-red-700 text-white"
                    }`}
                  >
                    {!isUnlocked ? (
                      <>
                        <Lock className="mr-2" size={16} />
                        Complete o módulo anterior
                      </>
                    ) : (
                      <>
                        <Play className="mr-2" size={16} />
                        {moduleProgress > 0 ? "Continuar Assistindo" : "Começar Módulo"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}