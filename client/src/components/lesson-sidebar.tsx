import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, CheckCircle, Clock, Download, MessageCircle } from "lucide-react";
import type { ModuleWithLessons, Progress, LessonWithProgress } from "@shared/schema";

interface LessonSidebarProps {
  currentLesson: LessonWithProgress;
  modules: ModuleWithLessons[];
  progress: Progress[];
  onLessonSelect: (lesson: LessonWithProgress) => void;
}

export default function LessonSidebar({ currentLesson, modules, progress, onLessonSelect }: LessonSidebarProps) {
  const currentModule = modules.find(m => m.id === currentLesson.moduleId);
  
  if (!currentModule) return null;

  const getLessonStatus = (lessonId: number) => {
    const lessonProgress = progress.find(p => p.lessonId === lessonId);
    if (lessonProgress?.isCompleted) return "completed";
    if (lessonId === currentLesson.id) return "current";
    return "pending";
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-netflix-gray">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-netflix-text">
            Aulas do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Lessons List */}
          <div className="space-y-3 mb-6">
            {currentModule.lessons.map((lesson) => {
              const status = getLessonStatus(lesson.id);
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson)}
                  className={`rounded-lg p-4 cursor-pointer transition-colors duration-200 border ${
                    status === "current" 
                      ? "bg-netflix-red/20 border-netflix-red/30"
                      : status === "completed"
                      ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                      : "bg-netflix-light-gray/50 border-netflix-light-gray/30 hover:bg-netflix-light-gray"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h6 className="font-medium text-netflix-text text-sm mb-1">{lesson.title}</h6>
                      <p className="netflix-text-secondary text-xs">{formatDuration(lesson.duration)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {status === "current" && (
                        <>
                          <Play className="text-netflix-red" size={16} />
                          <span className="text-netflix-red text-xs font-medium">Assistindo</span>
                        </>
                      )}
                      {status === "completed" && (
                        <>
                          <CheckCircle className="text-green-400" size={16} />
                          <span className="text-green-400 text-xs font-medium">Concluída</span>
                        </>
                      )}
                      {status === "pending" && (
                        <>
                          <Clock className="netflix-text-secondary" size={16} />
                          <span className="netflix-text-secondary text-xs">Pendente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Module Actions */}
          <div className="space-y-3">
            <Button 
              variant="ghost"
              className="w-full bg-netflix-light-gray hover:bg-netflix-red text-netflix-text hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Download className="mr-2" size={16} />
              Download Materiais
            </Button>
            <Button 
              variant="ghost"
              className="w-full bg-netflix-light-gray hover:bg-blue-600 text-netflix-text hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <MessageCircle className="mr-2" size={16} />
              Dúvidas e Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
