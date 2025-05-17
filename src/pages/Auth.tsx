
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { Eye, EyeOff, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

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
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateLoginForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    return isValid;
  };
  
  const validateSignupForm = () => {
    let isValid = true;
    
    if (!name) {
      setNameError("Nome é obrigatório");
      isValid = false;
    } else {
      setNameError("");
    }
    
    if (!signupEmail) {
      setSignupEmailError("Email é obrigatório");
      isValid = false;
    } else if (!validateEmail(signupEmail)) {
      setSignupEmailError("Email inválido");
      isValid = false;
    } else {
      setSignupEmailError("");
    }
    
    if (!signupPassword) {
      setSignupPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (signupPassword.length < 6) {
      setSignupPasswordError("A senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setSignupPasswordError("");
    }
    
    if (!passwordConfirm) {
      setPasswordConfirmError("Confirmação de senha é obrigatória");
      isValid = false;
    } else if (passwordConfirm !== signupPassword) {
      setPasswordConfirmError("As senhas não conferem");
      isValid = false;
    } else {
      setPasswordConfirmError("");
    }
    
    return isValid;
  };
  
  // Handle login with improved error handling
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
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
    
    if (!validateSignupForm()) {
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
    } catch (error) {
      console.error("Signup handling error:", error);
      setSignupSuccess(false);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-xl">MEI</span>
            </div>
          </div>
          <CardTitle className="text-2xl">MEI Finanças</CardTitle>
          <CardDescription>Gerencie suas finanças de maneira simples e eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center justify-between">
                    Email
                    {emailError && <span className="text-xs text-destructive">{emailError}</span>}
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={emailError ? "border-destructive" : ""}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="flex items-center justify-between">
                    Senha
                    {passwordError && <span className="text-xs text-destructive">{passwordError}</span>}
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={passwordError ? "border-destructive" : ""}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {signupSuccess ? (
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <Info className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta. 
                    Você já pode fazer login usando suas credenciais.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center justify-between">
                      Nome
                      {nameError && <span className="text-xs text-destructive">{nameError}</span>}
                    </Label>
                    <Input 
                      id="name"
                      type="text" 
                      placeholder="Seu nome" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={nameError ? "border-destructive" : ""}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="flex items-center justify-between">
                      Email
                      {signupEmailError && <span className="text-xs text-destructive">{signupEmailError}</span>}
                    </Label>
                    <Input 
                      id="signupEmail"
                      type="email" 
                      placeholder="seu@email.com" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={signupEmailError ? "border-destructive" : ""}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="flex items-center justify-between">
                      Senha
                      {signupPasswordError && <span className="text-xs text-destructive">{signupPasswordError}</span>}
                    </Label>
                    <div className="relative">
                      <Input 
                        id="signupPassword"
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={signupPasswordError ? "border-destructive" : ""}
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Senha deve ter pelo menos 6 caracteres</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm" className="flex items-center justify-between">
                      Confirme a senha
                      {passwordConfirmError && <span className="text-xs text-destructive">{passwordConfirmError}</span>}
                    </Label>
                    <Input 
                      id="passwordConfirm"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className={passwordConfirmError ? "border-destructive" : ""}
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Cadastrando..." : "Criar conta"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
          <p>
            {activeTab === "login" 
              ? "Novo no MEI Finanças? Clique em Cadastro" 
              : "Já tem uma conta? Clique em Login"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
