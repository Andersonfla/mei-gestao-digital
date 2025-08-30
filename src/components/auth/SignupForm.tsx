
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
      
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center justify-between text-gray-700">
          Nome
          {nameError && <span className="text-xs text-red-500">{nameError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <User className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
            autoComplete="name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupEmail" className="flex items-center justify-between text-gray-700">
          Email
          {emailError && <span className="text-xs text-red-500">{emailError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <Mail className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="signupEmail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
            autoComplete="email"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="flex items-center justify-between text-gray-700">
          Senha
          {passwordError && <span className="text-xs text-red-500">{passwordError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <Lock className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="signupPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 pr-10"
            minLength={6}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-auto p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500">Senha deve ter pelo menos 6 caracteres</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm" className="flex items-center justify-between text-gray-700">
          Confirme a senha
          {passwordConfirmError && <span className="text-xs text-red-500">{passwordConfirmError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <Lock className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="passwordConfirm"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
            minLength={6}
            autoComplete="new-password"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg transition-all duration-300" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Cadastrando..." : "Criar conta"}
      </Button>
    </form>
  );
}
