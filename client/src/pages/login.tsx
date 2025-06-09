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
import { Shield, LogIn } from "lucide-react";
import MatrixEffect from "@/components/matrix-effect";
import TypewriterEffect from "@/components/typewriter-effect";

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
    <div className="mobile-optimized relative overflow-hidden px-4">
      {/* Matrix Effect Background */}
      <MatrixEffect />
      
      {/* Dark overlay to improve readability */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* Mobile-centered login container */}
      <div className="relative z-20 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-sm">
          <Card className="mobile-card bg-netflix-gray/90 backdrop-blur-md border-netflix-light-gray/50 shadow-2xl shadow-netflix-red/20">
            <CardContent className="mobile-padding p-6">
              {/* Logo/Brand - Mobile optimized */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-netflix-text mb-3 animate-pulse-glow">
                  <span className="block text-netflix-red mb-2 animate-pulse text-3xl font-mono glitch-effect" data-text="</>">&lt;/&gt;</span>
                  <TypewriterEffect 
                    text="IA Revolution"
                    speed={120}
                    delay={800}
                    cursorChar="|"
                    className="block glitch-effect text-xl"
                  />
                </h1>
                <p className="netflix-text-secondary text-xs">Área de membros exclusiva</p>
              </div>
              
              {/* Login Form - Mobile optimized */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-netflix-text mb-2 text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12 bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text placeholder:netflix-text-secondary focus:ring-netflix-red focus:border-transparent text-base"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-netflix-text mb-2 text-sm">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-netflix-light-gray border-netflix-light-gray/50 text-netflix-text placeholder:netflix-text-secondary focus:ring-netflix-red focus:border-transparent text-base"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-netflix-red hover:bg-red-700 text-white font-semibold transition-all duration-200 animate-pulse-glow text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2" size={18} />
                      Entrar na Plataforma
                    </>
                  )}
                </Button>
              </form>
              
              {/* Security Badge - Mobile optimized */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="text-green-500" size={14} />
                  <span className="netflix-text-secondary text-xs">Acesso seguro e exclusivo para alunos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
