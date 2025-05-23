
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useToast } from "@/hooks/use-toast";

export function useAuthForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  const { validateLoginForm, validateSignupForm } = useFormValidation();
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Signup form state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nameError, setNameError] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  
  // Handle login with improved error handling
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm(email, password, setEmailError, setPasswordError)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      // Navigation is handled by the auth context
    } catch (error) {
      console.error("Login handling error:", error);
      // Error toast is shown by signIn function
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle signup with improved error handling
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous error message
    setSignupError("");
    
    if (!validateSignupForm(
      name, 
      signupEmail, 
      signupPassword, 
      passwordConfirm, 
      setNameError, 
      setSignupEmailError, 
      setSignupPasswordError, 
      setPasswordConfirmError
    )) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting signup process for:", signupEmail);
      await signUp(signupEmail, signupPassword, name);
      
      // Show success message
      console.log("Signup successful");
      setSignupSuccess(true);
      
      // Clear form
      setName("");
      setSignupEmail("");
      setSignupPassword("");
      setPasswordConfirm("");
      
      // Switch to login tab after a successful signup
      setTimeout(() => {
        setActiveTab("login");
      }, 3000);
      
    } catch (error: any) {
      console.error("Signup handling error:", error);
      setSignupSuccess(false);
      
      // More detailed error handling
      let errorMessage = "Erro ao criar conta. Verifique os dados e tente novamente.";
      
      if (error?.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "Este email já está cadastrado. Tente fazer login.";
        } else if (error.message.includes("password")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        } else if (error.message.includes("captcha")) {
          errorMessage = "Erro de verificação. Tente novamente mais tarde.";
        } else if (error.message.includes("Database error")) {
          errorMessage = "Erro ao criar conta, mas você pode tentar fazer login mesmo assim.";
          // If it's a database error, we might still have created the auth record
          // Show success with a warning
          setSignupSuccess(true);
        }
      }
      
      setSignupError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginProps = {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    showPassword,
    setShowPassword,
    isSubmitting,
    handleLogin
  };

  const signupProps = {
    name,
    setName,
    email: signupEmail,
    setEmail: setSignupEmail,
    password: signupPassword,
    setPassword: setSignupPassword,
    passwordConfirm,
    setPasswordConfirm,
    nameError,
    emailError: signupEmailError,
    passwordError: signupPasswordError,
    passwordConfirmError,
    showPassword,
    setShowPassword,
    signupError,
    signupSuccess,
    isSubmitting,
    handleSignup
  };

  return {
    user,
    loading,
    activeTab,
    setActiveTab,
    isSubmitting,
    signupSuccess,
    loginProps,
    signupProps
  };
}
