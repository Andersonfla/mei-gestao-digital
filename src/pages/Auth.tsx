
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuthForm } from "@/hooks/useAuthForm";

const Auth = () => {
  const navigate = useNavigate();
  
  const {
    user, 
    loading,
    activeTab,
    setActiveTab,
    signupSuccess,
    loginProps,
    signupProps
  } = useAuthForm();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log("Auth page: User is already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

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
          <LoginForm {...loginProps} />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm {...signupProps} />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default Auth;
