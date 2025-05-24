
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  emailError: string;
  passwordError: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export const LoginForm = ({
  onSubmit,
  isSubmitting,
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  passwordError,
  showPassword,
  setShowPassword,
}: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
  );
};
