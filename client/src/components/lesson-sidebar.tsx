import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveDownloadUrl, getMaterialsType } from "@/lib/video-utils";
import { Play, CheckCircle, Clock, Download, MessageCircle, ExternalLink, FolderOpen, Send } from "lucide-react";
import type { ModuleWithLessons, Progress, LessonWithProgress } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LessonSidebarProps {
  currentLesson: LessonWithProgress;
  modules: ModuleWithLessons[];
  progress: Progress[];
  onLessonSelect: (lesson: LessonWithProgress) => void;
}

export default function LessonSidebar({ currentLesson, modules, progress, onLessonSelect }: LessonSidebarProps) {
  const { toast } = useToast();
  const currentModule = modules.find(m => m.id === currentLesson.moduleId);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

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

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) {
      toast({
        title: "Mensagem inválida",
        description: "Por favor, escreva sua dúvida antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingSupport(true);

    // Simulate an API call
    setTimeout(() => {
      setIsSubmittingSupport(false);
      setShowSupportModal(false);
      setSupportMessage("");
      setSupportEmail("");

      toast({
        title: "Dúvida enviada!",
        description: "Sua dúvida foi enviada com sucesso. Nossa equipe responderá em breve.",
      });
    }, 1500);
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
              onClick={() => {
                if (currentModule.materialsUrl) {
                  const materialsType = getMaterialsType(currentModule.materialsUrl);

                  if (materialsType === 'folder') {
                    window.open(currentModule.materialsUrl, '_blank');
                    toast({
                      title: "Materiais abertos",
                      description: "Os materiais foram abertos em uma nova aba.",
                    });
                  } else {
                    try {
                      const downloadUrl = convertGoogleDriveDownloadUrl(currentModule.materialsUrl);

                      // Criar elemento temporário para download
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = `materiais_${currentModule.title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      toast({
                        title: "Download iniciado",
                        description: "O download dos materiais foi iniciado.",
                      });
                    } catch (error) {
                      // Fallback: abrir em nova aba
                      window.open(currentModule.materialsUrl, '_blank');
                      toast({
                        title: "Materiais abertos",
                        description: "Os materiais foram abertos em uma nova aba.",
                      });
                    }
                  }
                } else {
                  toast({
                    title: "Materiais não disponíveis",
                    description: "Este módulo não possui materiais para download.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!currentModule.materialsUrl}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 ${
                currentModule.materialsUrl 
                  ? "bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-700 hover:to-netflix-red text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                  : "bg-netflix-light-gray/30 text-netflix-text/40 cursor-not-allowed"
              }`}
            >
              {getMaterialsType(currentModule.materialsUrl || '') === 'folder' ? (
                <FolderOpen className="mr-2" size={18} />
              ) : (
                <Download className="mr-2" size={18} />
              )}
              <span>
                {currentModule.materialsUrl ? (
                  getMaterialsType(currentModule.materialsUrl) === 'folder' 
                    ? "Abrir Materiais" 
                    : "Baixar Materiais"
                ) : (
                  "Materiais Indisponíveis"
                )}
              </span>
              {currentModule.materialsUrl && (
                <ExternalLink className="ml-1" size={14} />
              )}
            </Button>
            {/* Support Button */}
          <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full bg-netflix-light-gray hover:bg-blue-600 text-netflix-text hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <MessageCircle className="mr-2" size={16} />
                Dúvidas e Suporte
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-netflix-gray border-netflix-light-gray max-w-md">
              <DialogHeader>
                <DialogTitle className="text-netflix-text">
                  Dúvidas sobre a aula
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-netflix-text text-sm font-medium">
                    Aula atual: {currentLesson.title}
                  </Label>
                  <p className="text-netflix-text-secondary text-xs mt-1">
                    Módulo: {currentModule?.title}
                  </p>
                </div>

                <div>
                  <Label htmlFor="supportEmail" className="text-netflix-text text-sm">
                    Email (opcional)
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="supportMessage" className="text-netflix-text text-sm">
                    Descreva sua dúvida *
                  </Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Descreva detalhadamente sua dúvida ou problema..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1 min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-netflix-text-secondary text-xs mt-1">
                    {supportMessage.length}/500 caracteres
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSupportModal(false)}
                    className="flex-1 border-netflix-text-secondary text-netflix-text-secondary"
                    disabled={isSubmittingSupport}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSupportSubmit}
                    disabled={isSubmittingSupport}
                    className="flex-1 bg-netflix-red hover:bg-red-700 text-white"
                  >
                    {isSubmittingSupport ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}