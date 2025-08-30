
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  emailError: string;
  passwordError: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isSubmitting: boolean;
  handleLogin: (e: React.FormEvent) => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  passwordError,
  showPassword,
  setShowPassword,
  isSubmitting,
  handleLogin,
}: LoginFormProps) => {
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center justify-between text-gray-700">
          Email
          {emailError && <span className="text-xs text-red-500">{emailError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <Mail className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="email"
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
        <Label htmlFor="password" className="flex items-center justify-between text-gray-700">
          Senha
          {passwordError && <span className="text-xs text-red-500">{passwordError}</span>}
        </Label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <Lock className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 pr-10"
            autoComplete="current-password"
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
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg transition-all duration-300" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
