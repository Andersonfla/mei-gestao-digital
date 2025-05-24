
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRequireAuth = () => {
  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Verificar imediatamente se o usuário está autenticado
    const checkAuth = async () => {
      // Somente verificar após o loading inicial para evitar redirecionamentos desnecessários
      if (!loading) {
        // Skip auth checks for the landing page
        if (location.pathname === "/") {
          return;
        }
        
        // Verificar se o usuário está autenticado para rotas protegidas
        if (!user && location.pathname.startsWith("/app")) {
          console.log("Nenhum usuário autenticado, redirecionando para /auth");
          
          toast({
            title: "Autenticação necessária",
            description: "Faça login para acessar esta página",
            variant: "destructive",
          });
          
          navigate("/auth", { replace: true });
          return;
        }
        
        // Verificar se a sessão é válida
        if (session) {
          try {
            const sessionExpiryTime = new Date(session.expires_at * 1000);
            const currentTime = new Date();
            
            if (sessionExpiryTime < currentTime) {
              console.log("Sessão expirada, redirecionando para /auth");
              
              toast({
                title: "Sessão expirada",
                description: "Faça login novamente para continuar",
                variant: "destructive",
              });
              
              // Forçar logout quando a sessão expirar
              await signOut();
              navigate("/auth", { replace: true });
              return;
            }
            
            // Verificar se a sessão ainda é válida no servidor
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session && location.pathname.startsWith("/app")) {
              console.log("Sessão invalidada no servidor, redirecionando para /auth");
              await signOut();
              navigate("/auth", { replace: true });
              return;
            }
            
            console.log("Sessão válida até:", sessionExpiryTime.toLocaleString(), "para usuário:", user.id);
          } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            // Se houver um erro ao verificar a validade da sessão, assumimos que é melhor fazer login novamente
            if (location.pathname.startsWith("/app")) {
              navigate("/auth", { replace: true });
            }
          }
        } else if (location.pathname.startsWith("/app")) {
          console.log("Sessão não encontrada, redirecionando para /auth");
          navigate("/auth", { replace: true });
        }
      }
    };
    
    checkAuth();
    
    // Verificar periodicamente a autenticação para garantir que a sessão seja válida
    const intervalId = setInterval(() => {
      // Only check for protected routes
      if (location.pathname.startsWith("/app")) {
        checkAuth();
      }
    }, 60000); // Verificar a cada minuto
    
    return () => clearInterval(intervalId);
  }, [user, session, loading, navigate, toast, signOut, location.pathname]);

  return { user, session, loading };
};
