
import { createContext, useContext } from "react";
import { useAuthState } from "./useAuthState";
import { signIn, signOut, signUp } from "./authActions"; 
import { useToast } from "@/hooks/use-toast";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuthState();
  const toast = useToast();

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
