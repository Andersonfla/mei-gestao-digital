
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { useAuth } from "@/contexts";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Se estiver carregando, mostra um spinner
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, mostra uma mensagem e botões para login/cadastro
  if (!user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-card border rounded-lg shadow-sm text-center space-y-6">
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar esta área. Por favor, faça login ou crie uma conta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/auth')}>
              Fazer Login
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth?tab=signup')}>
              Criar Conta
            </Button>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Voltar para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }
  
  // Se estiver autenticado, mostra o layout normal
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 overflow-auto">
        <main className="container py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
