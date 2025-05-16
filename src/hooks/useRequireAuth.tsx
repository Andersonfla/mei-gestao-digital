
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";

export const useRequireAuth = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      // Verificar se o usuário está autenticado
      if (!user) {
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
        const sessionExpiryTime = new Date(session.expires_at * 1000);
        const currentTime = new Date();
        
        if (sessionExpiryTime < currentTime) {
          console.log("Sessão expirada, redirecionando para /auth");
          
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente para continuar",
            variant: "destructive",
          });
          
          navigate("/auth", { replace: true });
          return;
        }
      }
    }
  }, [user, session, loading, navigate, toast]);

  return { user, session, loading };
};
