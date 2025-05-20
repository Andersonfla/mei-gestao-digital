
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";

export const useRequireAuth = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Somente verificar após o loading inicial para evitar redirecionamentos desnecessários
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
            navigate("/auth", { replace: true });
            return;
          }
          
          console.log("Sessão válida até:", sessionExpiryTime.toLocaleString(), "para usuário:", user.id);
        } catch (error) {
          console.error("Erro ao verificar sessão:", error);
          // Se houver um erro ao verificar a validade da sessão, assumimos que é melhor fazer login novamente
          navigate("/auth", { replace: true });
        }
      } else {
        console.log("Sessão não encontrada, redirecionando para /auth");
        navigate("/auth", { replace: true });
      }
    }
  }, [user, session, loading, navigate, toast]);

  return { user, session, loading };
};
