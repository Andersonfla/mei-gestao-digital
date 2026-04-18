import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { DebugLayoutInfo } from "@/components/debug/DebugLayoutInfo";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full max-w-full overflow-x-hidden"
      style={{ backgroundImage: "var(--gradient-app)" }}
    >
      <AppSidebar />

      <div className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col">
        {/* Sticky header with always-visible sidebar trigger */}
        <header className="sticky top-0 z-30 h-14 border-b border-border/50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center gap-2">
            <SidebarTrigger className="h-9 w-9 rounded-md hover:bg-accent" />
            <div className="ml-auto flex items-center gap-2">
              {/* Reservado para futuras ações globais (notificações, etc.) */}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full">
            <OfflineIndicator />
            <InstallPrompt />
            <DebugLayoutInfo />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
