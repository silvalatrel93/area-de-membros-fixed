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
  const [currentSlide, setCurrentSlide] = useState(0);

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
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      scrollContainerRef.current.scrollBy({ 
        left: cardWidth, 
        behavior: 'smooth' 
      });
      setCurrentSlide(prev => Math.min(modules.length - 1, prev + 1));
    }
  };

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Módulos do Curso</h3>
        <div className="hidden md:flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            className="p-2 lg:p-3 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full transition-all duration-300"
          >
            <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            className="p-2 lg:p-3 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full transition-all duration-300"
          >
            <ChevronRight size={20} className="lg:w-6 lg:h-6" />
          </Button>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {modules.map((module, index) => {
          const moduleProgress = getModuleProgress(module.id);
          const isUnlocked = isModuleUnlocked(index);
          const currentLesson = getCurrentLesson(module);

          return (
            <Card key={module.id} className={`smooth-card overflow-hidden transition-all duration-300 hover:scale-105 ${!isUnlocked ? 'opacity-60' : ''}`}>
              <div className="relative">
                <img 
                  src={module.imageUrl || '/placeholder.jpg'} 
                  alt={module.title}
                  className="w-full h-48 xl:h-56 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isUnlocked ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                    {isUnlocked ? 'DISPONÍVEL' : 'BLOQUEADO'}
                  </span>
                </div>
                <div className="absolute top-3 right-3 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                  {module.lessons.length} aulas
                </div>
              </div>

              <CardContent className="p-6">
                <h4 className="text-lg xl:text-xl font-bold text-white mb-3 line-clamp-2">{module.title}</h4>
                <p className="text-netflix-text-secondary text-sm mb-4 line-clamp-3">{module.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-netflix-text-secondary">Progresso</span>
                    <span className="text-white font-medium">{Math.round(moduleProgress)}%</span>
                  </div>
                  <Progress value={moduleProgress} className="h-2" />
                </div>

                <Button 
                  onClick={() => {
                    if (isUnlocked && currentLesson) {
                      const lessonWithProgress: LessonWithProgress = {
                        ...currentLesson,
                        progress: 0,
                        isCompleted: false
                      };
                      onLessonSelect(lessonWithProgress);
                    }
                  }}
                  disabled={!isUnlocked}
                  className="w-full bg-netflix-red hover:bg-red-700 text-white font-medium py-3 transition-all duration-300"
                >
                  {isUnlocked ? (
                    <>
                      <Play size={18} className="mr-2" />
                      Começar Módulo
                    </>
                  ) : (
                    <>
                      <Lock size={18} className="mr-2" />
                      Módulo Bloqueado
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile/Tablet Horizontal Scroll */}
      <div className="lg:hidden relative">
        <div 
          ref={scrollContainerRef} 
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex space-x-4 px-4 py-2" style={{ width: "max-content" }}>
            {modules.map((module, index) => {
              const moduleProgress = getModuleProgress(module.id);
              const isUnlocked = isModuleUnlocked(index);
              const currentLesson = getCurrentLesson(module);

              return (
                <Card 
                  key={module.id}
                  className="group smooth-card flex-none w-80 sm:w-96 hover:scale-105 transition-all duration-500 relative overflow-hidden snap-center bg-gradient-to-br from-netflix-gray/90 to-netflix-light-gray/50 backdrop-blur-sm border border-netflix-light-gray/30 shadow-xl hover:shadow-2xl hover:shadow-netflix-red/20"
                >
                  {/* Matrix Code Effect Background */}
                  <MatrixCodeEffect speed={80} className="absolute inset-0 opacity-10" />

                  {module.imageUrl && (
                    <div className="relative overflow-hidden">
                      <img 
                        src={module.imageUrl}
                        alt={module.title}
                        className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      {/* Overlay Content */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm transition-all duration-300 ${
                          !isUnlocked 
                            ? "bg-gray-500/90 text-gray-300"
                            : moduleProgress > 0 && moduleProgress < 100
                            ? "bg-netflix-red/90 text-white shadow-lg"
                            : moduleProgress >= 100
                            ? "bg-green-500/90 text-white shadow-lg"
                            : "bg-blue-500/90 text-white shadow-lg"
                        }`}>
                          {!isUnlocked ? "BLOQUEADO" : 
                           moduleProgress >= 100 ? "CONCLUÍDO" :
                           moduleProgress > 0 ? "EM ANDAMENTO" : "DISPONÍVEL"}
                        </span>

                        <span className="bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full border border-white/20">
                          {module.lessons.length} aulas
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                          <div className="flex justify-between items-center text-white text-sm mb-1">
                            <span className="font-medium">Progresso</span>
                            <span className="font-bold">{Math.round(moduleProgress)}%</span>
                          </div>
                          <Progress 
                            value={moduleProgress} 
                            className="h-1.5 bg-white/20" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6 relative z-10 space-y-4">
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-netflix-red transition-colors duration-300">
                        {module.title}
                      </h4>
                      <p className="text-netflix-text-secondary text-sm line-clamp-3 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-netflix-text-secondary">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-netflix-red rounded-full"></div>
                        <span>{module.lessons.length} vídeos</span>
                      </div>
                      {module.materialsUrl && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Materiais inclusos</span>
                        </div>
                      )}
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
                      className={`w-full py-3 px-4 rounded-lg transition-all duration-300 font-medium transform ${
                        !isUnlocked 
                          ? "bg-netflix-light-gray/50 text-netflix-text-secondary cursor-not-allowed"
                          : "bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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

        {/* Navigation Arrows - Mobile/Tablet */}
        <div className="flex md:hidden absolute top-1/2 -translate-y-1/2 left-2 right-2 justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            disabled={currentSlide === 0}
            className="p-2 bg-black/50 hover:bg-netflix-red/90 text-white rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            disabled={currentSlide >= modules.length - 1}
            className="p-2 bg-black/50 hover:bg-netflix-red/90 text-white rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}