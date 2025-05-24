
import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const RequireAuth = () => {
  const { user, loading } = useRequireAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the protected routes
  return <Outlet />;
};
