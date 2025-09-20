
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, AlertTriangle, Mail, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignupFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (password: string) => void;
  nameError: string;
  emailError: string;
  passwordError: string;
  passwordConfirmError: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  signupError?: string;
  signupSuccess: boolean;
  isSubmitting: boolean;
  handleSignup: (e: React.FormEvent) => void;
}

export const SignupForm = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  nameError,
  emailError,
  passwordError,
  passwordConfirmError,
  showPassword,
  setShowPassword,
  signupError,
  signupSuccess,
  isSubmitting,
  handleSignup,
}: SignupFormProps) => {
  if (signupSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta. 
          Você já pode fazer login usando suas credenciais.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {signupError && (
        <Alert className="bg-red-50 border-red-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {signupError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3">
        <Label htmlFor="name" className="flex items-center justify-between text-slate-700 font-medium">
          Nome Completo
          {nameError && <span className="text-xs text-red-500 font-normal">{nameError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <User className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
              autoComplete="name"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="signupEmail" className="flex items-center justify-between text-slate-700 font-medium">
          Email
          {emailError && <span className="text-xs text-red-500 font-normal">{emailError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <Mail className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="signupEmail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
              autoComplete="email"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="signupPassword" className="flex items-center justify-between text-slate-700 font-medium">
          Senha
          {passwordError && <span className="text-xs text-red-500 font-normal">{passwordError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <Lock className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
              minLength={6}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-auto p-1 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} className="text-slate-400 hover:text-slate-600 transition-colors" /> : <Eye size={18} className="text-slate-400 hover:text-slate-600 transition-colors" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500">Senha deve ter pelo menos 6 caracteres</p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="passwordConfirm" className="flex items-center justify-between text-slate-700 font-medium">
          Confirme a senha
          {passwordConfirmError && <span className="text-xs text-red-500 font-normal">{passwordConfirmError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <Lock className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="passwordConfirm"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Cadastrando...</span>
          </div>
        ) : (
          "Criar conta"
        )}
      </Button>
    </form>
  );
}
