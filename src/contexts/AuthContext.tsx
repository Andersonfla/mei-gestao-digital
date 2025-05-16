
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        
        if (currentSession) {
          console.log("User ID from session:", currentSession.user?.id || "No user ID");
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Handle specific auth events
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // If on auth page, navigate to dashboard
            if (window.location.pathname === '/auth') {
              navigate('/');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state and redirect to auth page
          console.log("User signed out, clearing session and user data");
          setSession(null);
          setUser(null);
          navigate('/auth');
        }
      }
    );

    // Check for existing session after setting up listener
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setLoading(false);
          return;
        }
        
        console.log("Initial session check:", currentSession ? "Session exists" : "No session");
        
        if (currentSession) {
          console.log("User ID from initial session:", currentSession.user?.id || "No user ID");
          setSession(currentSession);
          setUser(currentSession.user);
          
          // If user is logged in and on auth page, redirect to dashboard
          if (window.location.pathname === '/auth') {
            navigate('/');
          }
        } else {
          // If no session and not on auth page, redirect to auth
          if (window.location.pathname !== '/auth') {
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      // Clean up subscription when component unmounts
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Session will be cleared by the onAuthStateChange listener
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao desconectar",
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }
      
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      });
      
      if (error) throw error;
      
      console.log("Login successful, user ID:", data.user?.id);
      
      toast({
        title: "Login realizado",
        description: "Você foi conectado com sucesso",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // More user-friendly error message in Portuguese
      let errorMessage = "Verifique suas credenciais e tente novamente";
      
      if (error.message.includes("Invalid login")) {
        errorMessage = "Email ou senha inválidos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login";
      }
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error("Todos os campos são obrigatórios");
      }
      
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { 
          data: { name },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      console.log("Signup successful, user ID:", data.user?.id);
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar o cadastro",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // More user-friendly error message in Portuguese
      let errorMessage = "Verifique os dados e tente novamente";
      
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message.includes("password")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      }
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
