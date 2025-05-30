
import { supabase } from "@/integrations/supabase/client";
import { type ToastProps } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export const signOut = async (toast: ReturnType<typeof useToast>): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut({
      scope: 'local' // Only sign out from current device, preserving other sessions
    });
    
    if (error) {
      throw error;
    }
    
    // Session will be cleared by the onAuthStateChange listener
    toast.toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.toast({
      title: "Erro ao fazer logout",
      description: error.message || "Ocorreu um erro ao desconectar",
      variant: "destructive",
    });
  }
};

export const signIn = async (
  email: string,
  password: string,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
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
    
    toast.toast({
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
    
    toast.toast({
      title: "Erro ao fazer login",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error("Todos os campos são obrigatórios");
    }
    
    if (password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres");
    }
    
    console.log("Attempting to sign up with:", email);
    
    // Criar o usuário sem o captcha_token com autoConfirmation true
    const { error, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { 
        data: { name },
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error("Error during signup:", error);
      throw error;
    }
    
    console.log("Signup successful, user data:", data);
    
    // O perfil será criado automaticamente pelo trigger no Supabase
    
    toast.toast({
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
    } else if (error.message.includes("captcha")) {
      errorMessage = "Erro de verificação. Tente novamente mais tarde.";
    } else if (error.message.includes("Database error")) {
      errorMessage = "Erro ao criar conta, mas tente fazer login mesmo assim.";
    }
    
    toast.toast({
      title: "Erro ao criar conta",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  }
};
