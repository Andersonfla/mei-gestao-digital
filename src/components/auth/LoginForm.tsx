
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
      <div className="space-y-3">
        <Label htmlFor="email" className="flex items-center justify-between text-slate-700 font-medium">
          Email
          {emailError && <span className="text-xs text-red-500 font-normal">{emailError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <Mail className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="email"
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
        <Label htmlFor="password" className="flex items-center justify-between text-slate-700 font-medium">
          Senha
          {passwordError && <span className="text-xs text-red-500 font-normal">{passwordError}</span>}
        </Label>
        <div className="relative group">
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all duration-200 group-hover:border-slate-300">
            <Lock className="w-5 h-5 text-slate-400 mr-3 transition-colors group-focus-within:text-purple-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
              autoComplete="current-password"
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
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Entrando...</span>
          </div>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};
