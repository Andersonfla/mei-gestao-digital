import React, { createContext, useContext } from "react";
import { useAuthState } from "./useAuthState-simple";
import { signIn, signOut, signUp } from "./authActions"; 
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuthState();

  // Simple toast function that matches expected interface
  const simpleToast = {
    toast: (message: any) => {
      console.log('Toast:', message);
      return {
        id: 'simple-toast',
        dismiss: () => {},
        update: () => {}
      };
    },
    dismiss: () => {},
    toasts: []
  };

  const authContextValue: AuthContextType = {
    user, 
    session, 
    loading,
    signOut: () => signOut(simpleToast),
    signIn: (email: string, password: string) => signIn(email, password, simpleToast),
    signUp: (email: string, password: string, name: string) => 
      signUp(email, password, name, simpleToast)
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