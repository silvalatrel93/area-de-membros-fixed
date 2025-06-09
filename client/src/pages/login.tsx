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
    <div className="device-optimized relative overflow-hidden gradient-bg">
      {/* Matrix Effect Background */}
      <MatrixEffect />
      
      {/* Light overlay to improve text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 z-10"></div>
      
      {/* Responsive login container */}
      <div className="relative z-20 flex-1 flex items-center justify-center py-8 px-4 lg:py-12">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
          <Card className="smooth-card">
            <CardContent className="p-6 md:p-8 lg:p-10">
              {/* Logo/Brand - Responsive */}
              <div className="text-center mb-6 md:mb-8 lg:mb-10">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-netflix-text mb-4 animate-pulse-glow">
                  <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-3">
                    <span className="text-netflix-red animate-pulse text-3xl md:text-4xl lg:text-5xl font-mono glitch-effect" data-text="</>">&lt;/&gt;</span>
                    <TypewriterEffect 
                      text="IA Revolution"
                      speed={120}
                      delay={800}
                      cursorChar="|"
                      className="glitch-effect text-xl md:text-2xl lg:text-3xl whitespace-nowrap"
                    />
                  </div>
                </h1>
                <p className="netflix-text-secondary text-sm">Área de membros exclusiva</p>
              </div>
              
              {/* Responsive Login Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="email" className="text-netflix-text mb-2 md:mb-3 text-sm md:text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12 md:h-14 bg-black/10 border-netflix-red/40 text-netflix-text placeholder:netflix-text-secondary focus:ring-2 focus:ring-netflix-red focus:border-netflix-red text-sm md:text-base rounded-xl backdrop-blur-sm"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-400 text-xs md:text-sm mt-1 md:mt-2">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-netflix-text mb-2 md:mb-3 text-sm md:text-base font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 md:h-14 bg-black/10 border-netflix-red/40 text-netflix-text placeholder:netflix-text-secondary focus:ring-2 focus:ring-netflix-red focus:border-netflix-red text-sm md:text-base rounded-xl backdrop-blur-sm"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-400 text-xs md:text-sm mt-1 md:mt-2">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 md:h-14 bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transition-all duration-300 animate-pulse-glow text-sm md:text-base rounded-xl shadow-lg shadow-netflix-red/25"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center whitespace-nowrap">
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center whitespace-nowrap">
                      <LogIn className="mr-2" size={16} />
                      <span className="md:hidden">Entrar</span>
                      <span className="hidden md:block">Entrar na Plataforma</span>
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Security Badge - Responsive */}
              <div className="mt-4 md:mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 bg-green-500/10 py-2 md:py-3 px-3 md:px-4 rounded-full">
                  <Shield className="text-green-500" size={14} />
                  <span className="netflix-text-secondary text-xs md:text-sm whitespace-nowrap">Acesso seguro e exclusivo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}