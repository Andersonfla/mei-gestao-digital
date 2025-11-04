import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useFinance } from "@/contexts";
import { Loader2 } from "lucide-react";

export const RequirePremium = () => {
  const { isPremiumActive, isLoading } = useFinance();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show loading state while checking premium status
  if (isChecking || isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verificando plano...</p>
      </div>
    );
  }

  // Redirect to upgrade page if not premium
  if (!isPremiumActive) {
    return <Navigate to="/upgrade" replace />;
  }

  // If premium is active, render the protected routes
  return <Outlet />;
};
