import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePlanGuard } from "@/hooks/usePlanGuard";

export const RequirePremium = () => {
  const { isPremium, isLoading } = usePlanGuard();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsChecking(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isChecking || isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verificando plano...</p>
      </div>
    );
  }

  if (!isPremium) {
    return <Navigate to="/upgrade" replace />;
  }

  return <Outlet />;
};
