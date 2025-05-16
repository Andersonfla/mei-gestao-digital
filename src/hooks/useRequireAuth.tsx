
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, useFinance } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";

export const useRequireAuth = () => {
  const { user, session, loading } = useAuth();
  const { userSettings } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const isPremiumRequired = 
    location.pathname !== "/auth" && 
    location.pathname !== "/upgrade" &&
    !location.pathname.includes("/payment-success");

  useEffect(() => {
    // Verificar autenticação
    if (!loading && !user) {
      console.log("No authenticated user, redirecting to /auth");
      
      toast({
        title: "Autenticação necessária",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      
      navigate("/auth");
      return;
    }
    
    // Verificar validade da sessão
    if (session && new Date(session.expires_at * 1000) < new Date()) {
      console.log("Session expired, redirecting to /auth");
      
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente para continuar",
        variant: "destructive",
      });
      
      navigate("/auth");
      return;
    }

    // Verificar se o usuário tem uma assinatura ativa
    if (user && !loading && isPremiumRequired) {
      if (userSettings.plan !== 'premium') {
        console.log("User doesn't have premium plan, redirecting to /upgrade");
        
        toast({
          title: "Assinatura necessária",
          description: "Assine o plano para acessar esta função",
          variant: "destructive",
        });
        
        navigate("/upgrade");
      }
    }
  }, [user, session, loading, userSettings, navigate, toast, location.pathname, isPremiumRequired]);

  return { user, session, loading };
};
