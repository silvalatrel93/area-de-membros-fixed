import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveDownloadUrl, getMaterialsType } from "@/lib/video-utils";
import { Play, CheckCircle, Clock, Download, MessageCircle, ExternalLink, FolderOpen } from "lucide-react";
import type { ModuleWithLessons, Progress, LessonWithProgress } from "@shared/schema";

interface LessonSidebarProps {
  currentLesson: LessonWithProgress;
  modules: ModuleWithLessons[];
  progress: Progress[];
  onLessonSelect: (lesson: LessonWithProgress) => void;
}

export default function LessonSidebar({ currentLesson, modules, progress, onLessonSelect }: LessonSidebarProps) {
  const { toast } = useToast();
  const currentModule = modules.find(m => m.id === currentLesson.moduleId);
  
  if (!currentModule) return null;

  const getLessonStatus = (lessonId: number) => {
    const lessonProgress = progress.find(p => p.lessonId === lessonId);
    if (lessonProgress?.isCompleted) return "completed";
    if (lessonId === currentLesson.id) return "current";
    return "pending";
  };

  const handleDownloadMaterials = () => {
    if (!currentModule.materialsUrl) {
      toast({
        title: "Materiais não disponíveis",
        description: "Este módulo não possui materiais para download.",
        variant: "destructive"
      });
      return;
    }

    const materialsType = getMaterialsType(currentModule.materialsUrl);
    const processedUrl = convertGoogleDriveDownloadUrl(currentModule.materialsUrl);

    if (materialsType === 'folder') {
      // Open Google Drive folder in new tab
      window.open(currentModule.materialsUrl, '_blank');
      toast({
        title: "Pasta de materiais aberta",
        description: "A pasta do Google Drive foi aberta em uma nova aba."
      });
    } else if (materialsType === 'file') {
      // Direct download from Google Drive
      window.open(processedUrl, '_blank');
      toast({
        title: "Download iniciado",
        description: "O download dos materiais foi iniciado."
      });
    } else {
      // Direct link
      window.open(processedUrl, '_blank');
      toast({
        title: "Link aberto",
        description: "O link dos materiais foi aberto em uma nova aba."
      });
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  return (
    <div className="w-full">
      <Card className="bg-netflix-gray">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-netflix-text">
            Aulas do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Lessons List */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {currentModule.lessons.map((lesson) => {
              const status = getLessonStatus(lesson.id);
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson)}
                  className={`rounded-lg p-3 sm:p-4 cursor-pointer transition-colors duration-200 border ${
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
                          <div className="text-green-400 text-lg">✅</div>
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
          <div className="space-y-2 sm:space-y-3">
            <Button 
              variant="ghost"
              onClick={handleDownloadMaterials}
              disabled={!currentModule.materialsUrl}
              className={`w-full py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentModule.materialsUrl 
                  ? "bg-netflix-light-gray hover:bg-netflix-red text-netflix-text hover:text-white" 
                  : "bg-netflix-light-gray/50 text-netflix-text/50 cursor-not-allowed"
              }`}
            >
              {getMaterialsType(currentModule.materialsUrl || '') === 'folder' ? (
                <FolderOpen className="mr-2" size={16} />
              ) : (
                <Download className="mr-2" size={16} />
              )}
              {currentModule.materialsUrl ? (
                getMaterialsType(currentModule.materialsUrl) === 'folder' 
                  ? "Abrir Materiais" 
                  : "Download Materiais"
              ) : (
                "Sem Materiais"
              )}
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
