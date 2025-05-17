
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useFormValidation } from "@/hooks/useFormValidation";

const Auth = () => {
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
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log("Auth page: User is already logged in, redirecting to home");
      navigate("/");
    }
  }, [user, loading, navigate]);
  
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
    
    // Limpar mensagem de erro anterior
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
      await signUp(signupEmail, signupPassword, name);
      // Mostrar mensagem de sucesso
      setSignupSuccess(true);
      // Limpar formulário
      setName("");
      setSignupEmail("");
      setSignupPassword("");
      setPasswordConfirm("");
    } catch (error: any) {
      console.error("Signup handling error:", error);
      setSignupSuccess(false);
      setSignupError(error.message || "Erro ao criar conta. Verifique os dados e tente novamente.");
      // Error toast is shown by signUp function
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const footerText = activeTab === "login" 
    ? "Novo no MEI Finanças? Clique em Cadastro" 
    : "Já tem uma conta? Clique em Login";

  return (
    <AuthLayout activeTab={activeTab} footerText={footerText}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Cadastro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm 
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            emailError={emailError}
            passwordError={passwordError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm 
            onSubmit={handleSignup}
            isSubmitting={isSubmitting}
            signupSuccess={signupSuccess}
            name={name}
            setName={setName}
            email={signupEmail}
            setEmail={setSignupEmail}
            password={signupPassword}
            setPassword={setSignupPassword}
            passwordConfirm={passwordConfirm}
            setPasswordConfirm={setPasswordConfirm}
            nameError={nameError}
            emailError={signupEmailError}
            passwordError={signupPasswordError}
            passwordConfirmError={passwordConfirmError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            signupError={signupError}
          />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default Auth;
