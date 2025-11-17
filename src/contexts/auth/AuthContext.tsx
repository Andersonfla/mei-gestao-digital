
import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "./useAuthState";
import { signIn, signOut, signUp } from "./authActions"; 
import { useToast } from "@/hooks/use-toast";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuthState();
  const toast = useToast();
  const navigate = useNavigate();

  // Handle navigation based on auth state changes
  useEffect(() => {
    if (!loading) {
      const currentPath = window.location.pathname;
      
      if (user) {
        // User is logged in - redirect from auth page to dashboard
        if (currentPath === '/auth') {
          navigate('/dashboard');
        }
      } else {
        // User is logged out - redirect protected routes to auth
        const protectedRoutes = ["/dashboard", "/transacoes", "/relatorios", "/configuracoes", "/upgrade", "/thanks", "/admin", "/premium"];
        const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
        
        if (isProtectedRoute) {
          navigate('/auth');
        }
      }
    }
  }, [user, loading, navigate]);

  const authContextValue: AuthContextType = {
    user, 
    session, 
    loading,
    signOut: () => signOut(toast),
    signIn: (email: string, password: string) => signIn(email, password, toast),
    signUp: (email: string, password: string, name: string) => 
      signUp(email, password, name, toast)
  };

  return (
    <AuthContext.Provider value={authContextValue}>
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
