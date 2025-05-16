
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useRequireAuth = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only redirect if we've finished loading and there's no user
    if (!loading && !user) {
      console.log("No authenticated user, redirecting to /auth");
      
      toast({
        title: "Autenticação necessária",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      
      navigate("/auth");
    }
    
    // Check session validity
    if (session && new Date(session.expires_at * 1000) < new Date()) {
      console.log("Session expired, redirecting to /auth");
      
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente para continuar",
        variant: "destructive",
      });
      
      navigate("/auth");
    }
  }, [user, session, loading, navigate, toast]);

  return { user, session, loading };
};
