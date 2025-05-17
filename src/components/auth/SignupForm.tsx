
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignupFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  signupSuccess: boolean;
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
}

export const SignupForm = ({
  onSubmit,
  isSubmitting,
  signupSuccess,
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
}: SignupFormProps) => {
  if (signupSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <Info className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta. 
          Você já pode fazer login usando suas credenciais.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {signupError && (
        <Alert className="bg-red-50 border-red-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {signupError}
          </AlertDescription>
        </Alert>
      )}
      
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
          {emailError && <span className="text-xs text-destructive">{emailError}</span>}
        </Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={emailError ? "border-destructive" : ""}
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="flex items-center justify-between">
          Senha
          {passwordError && <span className="text-xs text-destructive">{passwordError}</span>}
        </Label>
        <div className="relative">
          <Input
            id="signupPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "border-destructive" : ""}
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
  );
};
