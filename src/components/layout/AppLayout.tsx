
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { DebugLayoutInfo } from "@/components/debug/DebugLayoutInfo";

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
      <div className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden" style={{ width: '100%', maxWidth: '100%', marginLeft: 0, paddingLeft: 0 }}>
        <main className="w-full max-w-full py-6 px-4 sm:px-6 lg:px-8" style={{ width: '100%', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <OfflineIndicator />
          <InstallPrompt />
          <DebugLayoutInfo />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
