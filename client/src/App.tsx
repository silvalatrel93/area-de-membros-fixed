import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { authService } from "@/lib/auth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!authService.isLoggedIn()) {
    return <LoginPage />;
  }
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  if (!authService.isLoggedIn()) {
    return <LoginPage />;
  }
  if (!authService.isAdmin()) {
    return <Dashboard />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => 
        authService.isLoggedIn() ? <Dashboard /> : <LoginPage />
      } />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={() => 
        <ProtectedRoute component={Dashboard} />
      } />
      <Route path="/admin" component={() => 
        <AdminRoute component={AdminPage} />
      } />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-netflix-dark text-netflix-text">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
