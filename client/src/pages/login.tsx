import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { Play, Shield, LogIn } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const user = await authService.login(data.email, data.password);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo${user.isAdmin ? ", administrador" : ""}!`,
      });
      
      if (user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-netflix-dark via-netflix-gray to-netflix-dark">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full p-8">
          <div className="col-span-3 bg-gradient-to-b from-netflix-red/20 to-transparent rounded-lg"></div>
          <div className="col-span-2 bg-gradient-to-t from-netflix-red/10 to-transparent rounded-lg"></div>
          <div className="col-span-4 bg-gradient-to-r from-netflix-red/15 to-transparent rounded-lg"></div>
          <div className="col-span-3 bg-gradient-to-l from-netflix-red/10 to-transparent rounded-lg"></div>
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="bg-netflix-gray/80 backdrop-blur-sm border-netflix-light-gray/50">
          <CardContent className="p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-netflix-text mb-2">
                <Play className="inline-block text-netflix-red mr-2" size={32} />
                LearnFlix
              </h1>
              <p className="netflix-text-secondary text-sm">Área de membros exclusiva</p>
            </div>
            
            {/* Login Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-netflix-text mb-2">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text placeholder:netflix-text-secondary focus:ring-netflix-red focus:border-transparent"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="text-netflix-text mb-2">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text placeholder:netflix-text-secondary focus:ring-netflix-red focus:border-transparent"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-netflix-red hover:bg-red-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="mr-2" size={18} />
                )}
                Entrar na Plataforma
              </Button>
            </form>
            
            {/* Info */}
            <div className="mt-6 text-center">
              <p className="netflix-text-secondary text-xs">
                <Shield className="inline mr-1" size={12} />
                Acesso seguro e exclusivo para alunos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
