import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertModuleSchema, insertLessonSchema, type InsertModule, type InsertLesson, type ModuleWithLessons } from "@shared/schema";
import { Plus, Edit, Eye, Trash, Settings, ArrowLeft } from "lucide-react";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<ModuleWithLessons | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleWithLessons | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    imageUrl: '',
    materialsUrl: ''
  });
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  const { data: modules, isLoading } = useQuery({
    queryKey: ["/api/modules"],
  });

  const moduleForm = useForm<InsertModule>({
    resolver: zodResolver(insertModuleSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      materialsUrl: "",
      orderIndex: 0,
      isActive: true,
    },
  });

  const lessonForm = useForm<InsertLesson>({
    resolver: zodResolver(insertLessonSchema),
    defaultValues: {
      moduleId: 0,
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      orderIndex: 0,
      isActive: true,
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: InsertModule) => apiRequest("POST", "/api/modules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setShowModuleDialog(false);
      moduleForm.reset();
      toast({ title: "Módulo criado com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar módulo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertModule> }) => 
      apiRequest("PUT", `/api/modules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setShowModuleDialog(false);
      setEditingModule(null);
      moduleForm.reset();
      toast({ title: "Módulo atualizado com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atualizar módulo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: InsertLesson) => apiRequest("POST", "/api/lessons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setShowLessonDialog(false);
      lessonForm.reset();
      toast({ title: "Aula criada com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar aula", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Módulo excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao excluir módulo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Aula excluída com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao excluir aula", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleCreateModule = (data: InsertModule) => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data });
    } else {
      createModuleMutation.mutate(data);
    }
  };

  const handleEditModule = (module: ModuleWithLessons) => {
    setEditingModule(module);
    setNewModule({
      title: module.title,
      description: module.description || "",
      imageUrl: module.imageUrl || "",
      materialsUrl: module.materialsUrl || "",
    });
    setShowNewModuleModal(true);
  };

  const handleCloseModuleDialog = () => {
    setShowModuleDialog(false);
    setEditingModule(null);
    moduleForm.reset();
  };

  const handleCreateLesson = (data: InsertLesson) => {
    if (!selectedModule) return;
    createLessonMutation.mutate({
      ...data,
      moduleId: selectedModule.id,
    });
  };

  const testEmailConnection = async () => {
    setEmailStatus('testing');
    try {
      const response = await fetch('/api/support/test-email');
      const result = await response.json();

      if (result.connected) {
        setEmailStatus('success');
        toast({
          title: "Conexão de email funcionando",
          description: "O serviço de email está configurado corretamente.",
        });
      } else {
        setEmailStatus('error');
        toast({
          title: "Erro na conexão de email",
          description: "Verifique as configurações de email no arquivo .env",
          variant: "destructive",
        });
      }
    } catch (error) {
      setEmailStatus('error');
      toast({
        title: "Erro ao testar email",
        description: "Não foi possível testar a conexão de email.",
        variant: "destructive",
      });
    }

    // Reset status after 3 seconds
    setTimeout(() => setEmailStatus('idle'), 3000);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const modulesList = modules as ModuleWithLessons[] || [];

  const createNewModule = async () => {
    if (!newModule.title.trim() || !newModule.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingModule(true);
    try {
      const url = editingModule ? `/api/modules/${editingModule.id}` : '/api/modules';
      const method = editingModule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });

      if (!response.ok) {
        throw new Error(editingModule ? 'Erro ao atualizar módulo' : 'Erro ao criar módulo');
      }

      toast({
        title: editingModule ? "Módulo atualizado com sucesso" : "Módulo criado com sucesso",
        description: `O módulo "${newModule.title}" foi ${editingModule ? 'atualizado' : 'criado'}.`,
      });

      // Reset form and close modal
      setNewModule({ title: '', description: '', imageUrl: '', materialsUrl: '' });
      setEditingModule(null);
      setShowNewModuleModal(false);

      // Refresh modules list
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });

    } catch (error) {
      console.error('Erro ao processar módulo:', error);
      toast({
        title: editingModule ? "Erro ao atualizar módulo" : "Erro ao criar módulo",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingModule(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-netflix-text text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 backdrop-blur-sm border-b border-red-600/30 shadow-lg shadow-red-900/20">
        <div className="responsive-container">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            <div className="flex items-center">
              <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-netflix-text">
                <span className="inline text-netflix-red mr-1 sm:mr-2 text-lg sm:text-xl font-mono">&lt;/&gt;</span>
                <span className="hidden sm:inline">IA REVOLUTION Admin</span>
                <span className="sm:hidden">Admin</span>
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                size="sm"
                className="p-2 bg-netflix-light-gray/20 hover:bg-netflix-light-gray/30 border-netflix-light-gray/40"
              >
                <ArrowLeft size={16} />
              </Button>
              <Button
                onClick={() => authService.logout()}
                size="sm"
                className="text-xs sm:text-sm bg-netflix-red/80 hover:bg-netflix-red/90"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="responsive-container py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-netflix-text">
            <Settings className="inline text-netflix-red mr-2" size={24} />
            <span className="hidden sm:inline">Painel Administrativo</span>
            <span className="sm:hidden">Admin</span>
          </h2>

          <Button
                onClick={() => setShowNewModuleModal(true)}
                size="sm"
                className="w-full sm:w-auto bg-netflix-red/80 hover:bg-netflix-red/90 text-white"
              >
                <Plus className="mr-2" size={16} />
                Novo Módulo
              </Button>
            
        </div>

        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-netflix-text mb-4">Gerenciar Módulos</h3>

            <div className="space-y-3 sm:space-y-4">
              {modulesList.map((module) => (
                <Card key={module.id} className="bg-netflix-gray/60 border-netflix-light-gray/30 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <h4 className="font-medium text-netflix-text text-sm sm:text-base line-clamp-2">{module.title}</h4>
                      <div className="flex space-x-1 sm:space-x-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditModule(module)}
                          className="text-netflix-text-secondary hover:text-netflix-text hover:bg-netflix-light-gray/20 p-1 sm:p-2"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                          className="text-netflix-text-secondary hover:text-netflix-text hover:bg-netflix-light-gray/20 p-1 sm:p-2"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteModuleMutation.mutate(module.id)}
                          className="text-netflix-text-secondary hover:text-netflix-red hover:bg-red-500/10 p-1 sm:p-2"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="netflix-text-secondary text-xs sm:text-sm mb-3">
                      {module.lessons.length} aulas • Status: {module.isActive ? "Ativo" : "Inativo"}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        module.isActive 
                          ? "bg-green-500/15 text-green-400" 
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {module.isActive ? "Publicado" : "Rascunho"}
                      </span>
                      <span className="bg-blue-500/15 text-blue-400 px-2 py-1 rounded text-xs">
                        {module.lessons.length} Vídeos
                      </span>
                      {module.materialsUrl && (
                        <span className="bg-purple-500/15 text-purple-400 px-2 py-1 rounded text-xs">
                          Materiais
                        </span>
                      )}
                    </div>

                    {selectedModule?.id === module.id && (
                      <div className="mt-4 pt-4 border-t border-netflix-light-gray/30">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-netflix-text text-sm">Aulas do Módulo</h5>
                          <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-netflix-red hover:bg-red-700">
                                <Plus size={14} className="mr-1" />
                                Nova Aula
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-netflix-gray border-netflix-light-gray">
                              <DialogHeader>
                                <DialogTitle className="text-netflix-text">Criar Nova Aula</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={lessonForm.handleSubmit(handleCreateLesson)} className="space-y-4">
                                <div>
                                  <Label htmlFor="lessonTitle" className="text-netflix-text">Título</Label>
                                  <Input
                                    id="lessonTitle"
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("title")}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="lessonDescription" className="text-netflix-text">Descrição</Label>
                                  <Textarea
                                    id="lessonDescription"
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("description")}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="videoUrl" className="text-netflix-text">URL do Vídeo</Label>
                                  <Input
                                    id="videoUrl"
                                    placeholder="Cole o link do Google Drive, YouTube ou vídeo direto"
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("videoUrl")}
                                  />
                                  <div className="mt-2 text-xs netflix-text-secondary space-y-1">
                                    <p><strong>Google Drive:</strong> https://drive.google.com/file/d/ID/view</p>
                                    <p><strong>YouTube:</strong> https://youtube.com/watch?v=ID</p>
                                    <p><strong>Vídeo Direto:</strong> https://exemplo.com/video.mp4</p>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="duration" className="text-netflix-text">Duração (segundos)</Label>
                                  <Input
                                    id="duration"
                                    type="number"
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("duration", { valueAsNumber: true })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="lessonOrderIndex" className="text-netflix-text">Ordem</Label>
                                  <Input
                                    id="lessonOrderIndex"
                                    type="number"
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("orderIndex", { valueAsNumber: true })}
                                  />
                                </div>
                                <Button 
                                  type="submit" 
                                  disabled={createLessonMutation.isPending}
                                  className="w-full bg-netflix-red hover:bg-red-700"
                                >
                                  {createLessonMutation.isPending ? "Criando..." : "Criar Aula"}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 bg-netflix-light-gray/30 rounded">
                              <div>
                                <span className="text-netflix-text text-sm font-medium">{lesson.title}</span>
                                <span className="netflix-text-secondary text-xs ml-2">
                                  {lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : ''}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteLessonMutation.mutate(lesson.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>

              {/* Email Configuration Section */}
              <div>
                <h3 className="text-lg font-semibold text-netflix-text mb-4">Configurações de Email</h3>
                <Card className="bg-netflix-gray border-netflix-light-gray">
                  <CardContent className="p-6">
                    <p className="text-netflix-text">Configure as settings do serviço de email para enviar notificações e suporte.</p>
                    <Button
                      onClick={testEmailConnection}
                      disabled={emailStatus === 'testing'}
                      variant="outline"
                      className={`mt-4 text-netflix-text hover:bg-blue-500/20 ${
                        emailStatus === 'success' ? 'bg-green-500/20' :
                        emailStatus === 'error' ? 'bg-red-500/20' : ''
                      }`}
                    >
                      {emailStatus === 'testing' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-netflix-text/30 border-t-netflix-text rounded-full animate-spin mr-2" />
                          Testando...
                        </>
                      ) : emailStatus === 'success' ? (
                        <>
                          <CheckCircle className="mr-2 text-green-400" size={16} />
                          Email OK
                        </>
                      ) : emailStatus === 'error' ? (
                        <>
                          <XCircle className="mr-2 text-red-400" size={16} />
                          Email Erro
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2" size={16} />
                          Testar Email
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
      </main>

      {/* New Module Modal */}
      <Dialog open={showNewModuleModal} onOpenChange={setShowNewModuleModal}>
        <DialogContent className="bg-netflix-gray border-netflix-light-gray max-w-md">
          <DialogHeader>
            <DialogTitle className="text-netflix-text">
              {editingModule ? "Editar Módulo" : "Criar Novo Módulo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="moduleTitle" className="text-netflix-text text-sm">
                Título do Módulo *
              </Label>
              <Input
                id="moduleTitle"
                type="text"
                placeholder="Ex: Fundamentos de JavaScript"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1"
              />
            </div>

            <div>
              <Label htmlFor="moduleDescription" className="text-netflix-text text-sm">
                Descrição *
              </Label>
              <Textarea
                id="moduleDescription"
                placeholder="Descreva o que será aprendido neste módulo..."
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-netflix-text text-sm">
                URL da Imagem de Capa (opcional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={newModule.imageUrl || ''}
                onChange={(e) => setNewModule({ ...newModule, imageUrl: e.target.value })}
                className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1"
              />
              <p className="text-netflix-text-secondary text-xs mt-1">
                Link para imagem que será exibida como capa do módulo
              </p>
            </div>

            <div>
              <Label htmlFor="materialsUrl" className="text-netflix-text text-sm">
                URL dos Materiais (opcional)
              </Label>
              <Input
                id="materialsUrl"
                type="url"
                placeholder="https://drive.google.com/..."
                value={newModule.materialsUrl}
                onChange={(e) => setNewModule({ ...newModule, materialsUrl: e.target.value })}
                className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text mt-1"
              />
              <p className="text-netflix-text-secondary text-xs mt-1">
                Link para Google Drive, Dropbox ou outro serviço de armazenamento
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={createNewModule}
                disabled={isCreatingModule}
                className="flex-1 bg-netflix-red hover:bg-red-700 text-white"
              >
                {isCreatingModule ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {editingModule ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    {editingModule ? "Atualizar Módulo" : "Criar Módulo"}
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setNewModule({ title: '', description: '', imageUrl: '', materialsUrl: '' });
                  setEditingModule(null);
                  setShowNewModuleModal(false);
                }}
                variant="ghost"
                className="flex-1 bg-netflix-light-gray hover:bg-netflix-text-secondary text-netflix-text hover:text-netflix-dark"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}