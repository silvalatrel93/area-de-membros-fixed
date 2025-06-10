import { queryClient, apiRequest } from "./queryClient";

export interface AuthUser {
  sessionId: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  success: boolean;
  isAdmin: boolean;
  sessionId: string;
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('Tentando login com:', { email });
      const data = await apiRequest("POST", "/api/auth/login", { email, password });

      if (!data.success) {
        throw new Error(data.message || "Falha na autenticação");
      }

      const user: AuthUser = {
        sessionId: data.sessionId,
        isAdmin: data.isAdmin,
      };

      // Store in localStorage
      localStorage.setItem("learnflix_auth", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Erro no login:", error);
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('conexão')) {
          throw new Error("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
        }
        if (error.message.includes('401') || error.message.includes('Credenciais')) {
          throw new Error("Email ou senha incorretos. Use admin@admin.com/admin123 ou aluno@aluno.com/123456");
        }
        throw error;
      }
      throw new Error("Erro inesperado. Tente novamente mais tarde.");
    }
  },

  logout(): void {
    localStorage.removeItem("learnflix_auth");
    localStorage.removeItem("learnflix_progress");
    queryClient.clear();
    // Force page reload to ensure clean state
    window.location.href = "/login";
  },

  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem("learnflix_auth");
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  },

  getSessionId(): string | null {
    const user = this.getCurrentUser();
    return user?.sessionId || null;
  },
};