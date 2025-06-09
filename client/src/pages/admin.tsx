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
import { Play, Plus, Edit, Eye, Trash, Settings, Upload, Link as LinkIcon, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<ModuleWithLessons | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);

  const { data: modules, isLoading } = useQuery({
    queryKey: ["/api/modules"],
  });

  const moduleForm = useForm<InsertModule>({
    resolver: zodResolver(insertModuleSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
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
    createModuleMutation.mutate(data);
  };

  const handleCreateLesson = (data: InsertLesson) => {
    if (!selectedModule) return;
    createLessonMutation.mutate({
      ...data,
      moduleId: selectedModule.id,
    });
  };

  const modulesList = modules as ModuleWithLessons[] || [];

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
      <nav className="bg-netflix-dark/95 backdrop-blur-sm border-b border-netflix-light-gray/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-netflix-text">
                <Play className="inline text-netflix-red mr-1 sm:mr-2" size={20} />
                <span className="hidden sm:inline">LearnFlix Admin</span>
                <span className="sm:hidden">Admin</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                size="sm"
                className="border-netflix-text-secondary text-netflix-text-secondary hover:bg-netflix-text-secondary hover:text-netflix-dark text-xs sm:text-sm px-2 sm:px-3"
              >
                <ArrowLeft className="mr-1" size={14} />
                <span className="hidden sm:inline">Voltar</span>
                <span className="sm:hidden">←</span>
              </Button>
              <Button
                onClick={() => authService.logout()}
                className="bg-netflix-red hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3"
                size="sm"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-netflix-text">
            <Settings className="inline text-netflix-red mr-2" size={28} />
            Painel Administrativo
          </h2>
          
          <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
            <DialogTrigger asChild>
              <Button className="bg-netflix-red hover:bg-red-700 text-white">
                <Plus className="mr-2" size={18} />
                Novo Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-netflix-gray border-netflix-light-gray">
              <DialogHeader>
                <DialogTitle className="text-netflix-text">Criar Novo Módulo</DialogTitle>
              </DialogHeader>
              <form onSubmit={moduleForm.handleSubmit(handleCreateModule)} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-netflix-text">Título</Label>
                  <Input
                    id="title"
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                    {...moduleForm.register("title")}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-netflix-text">Descrição</Label>
                  <Textarea
                    id="description"
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                    {...moduleForm.register("description")}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-netflix-text">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                    {...moduleForm.register("imageUrl")}
                  />
                </div>
                <div>
                  <Label htmlFor="orderIndex" className="text-netflix-text">Ordem</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                    {...moduleForm.register("orderIndex", { valueAsNumber: true })}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={createModuleMutation.isPending}
                  className="w-full bg-netflix-red hover:bg-red-700"
                >
                  {createModuleMutation.isPending ? "Criando..." : "Criar Módulo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Modules Management */}
          <div>
            <h3 className="text-lg font-semibold text-netflix-text mb-4">Gerenciar Módulos</h3>
            
            <div className="space-y-4">
              {modulesList.map((module) => (
                <Card key={module.id} className="bg-netflix-gray border-netflix-light-gray">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-netflix-text">{module.title}</h4>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedModule(module)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteModuleMutation.mutate(module.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="netflix-text-secondary text-sm mb-2">
                      {module.lessons.length} aulas • Status: {module.isActive ? "Ativo" : "Inativo"}
                    </p>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        module.isActive 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {module.isActive ? "Publicado" : "Rascunho"}
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                        {module.lessons.length} Vídeos
                      </span>
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
                                    className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text"
                                    {...lessonForm.register("videoUrl")}
                                  />
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
          
          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-netflix-text mb-4">Upload de Conteúdo</h3>
            
            <Card className="bg-netflix-gray border-netflix-light-gray">
              <CardContent className="p-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-netflix-light-gray rounded-lg p-8 text-center hover:border-netflix-red transition-colors duration-200 cursor-pointer mb-4">
                  <Upload className="mx-auto netflix-text-secondary mb-4" size={48} />
                  <p className="text-netflix-text mb-2">Clique para fazer upload ou arraste arquivos aqui</p>
                  <p className="netflix-text-secondary text-sm">Suporte para MP4, MOV, AVI (máx. 2GB)</p>
                  <input type="file" className="hidden" accept="video/*" multiple />
                </div>
                
                {/* URL Input */}
                <div>
                  <Label className="block text-sm font-medium text-netflix-text mb-2">Ou insira URL do vídeo</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="url" 
                      placeholder="https://vimeo.com/..." 
                      className="flex-1 bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text placeholder:netflix-text-secondary"
                    />
                    <Button className="bg-netflix-red hover:bg-red-700">
                      <LinkIcon size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
