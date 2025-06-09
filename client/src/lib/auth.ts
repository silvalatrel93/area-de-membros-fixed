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
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data: LoginResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    const user: AuthUser = {
      sessionId: data.sessionId,
      isAdmin: data.isAdmin,
    };
    
    // Store in localStorage
    localStorage.setItem("learnflix_auth", JSON.stringify(user));
    
    return user;
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
