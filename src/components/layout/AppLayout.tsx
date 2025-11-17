
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

export function AppLayout() {
  const { loading } = useRequireAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      <AppSidebar />
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <main className="w-full max-w-full py-6 px-4 sm:px-6 lg:container lg:mx-auto box-border">
          <OfflineIndicator />
          <InstallPrompt />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
