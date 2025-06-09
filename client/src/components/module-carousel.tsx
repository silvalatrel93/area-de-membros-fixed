import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { progressService } from "@/lib/progress";
import { ChevronLeft, ChevronRight, Play, Lock } from "lucide-react";
import type { ModuleWithLessons, Progress as ProgressType, LessonWithProgress } from "@shared/schema";

interface ModuleCarouselProps {
  modules: ModuleWithLessons[];
  progress: ProgressType[];
  onLessonSelect: (lesson: LessonWithProgress) => void;
}

export default function ModuleCarousel({ modules, progress, onLessonSelect }: ModuleCarouselProps) {
  const getModuleProgress = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    return progressService.calculateModuleProgress(module.lessons, progress);
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

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-netflix-text">Módulos do Curso</h3>
        <div className="hidden sm:flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 bg-netflix-light-gray hover:bg-netflix-red text-netflix-text-secondary hover:text-white rounded-full"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 sm:space-x-4 pb-4" style={{ width: "max-content" }}>
          {modules.map((module, index) => {
            const moduleProgress = getModuleProgress(module.id);
            const isUnlocked = isModuleUnlocked(index);
            const currentLesson = getCurrentLesson(module);
            
            return (
              <Card 
                key={module.id}
                className={`flex-none w-72 sm:w-80 bg-netflix-gray hover:scale-105 transition-transform duration-300 border ${
                  moduleProgress > 0 ? 'border-netflix-red/30' : 'border-netflix-light-gray/30'
                }`}
              >
                {module.imageUrl && (
                  <img 
                    src={module.imageUrl}
                    alt={module.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="p-6">
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
                    onClick={() => isUnlocked && onLessonSelect(currentLesson)}
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
