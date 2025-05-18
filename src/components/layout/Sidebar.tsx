import { useFinanceData } from "@/contexts/finance/hooks";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts";
import { useAuth } from "@/contexts";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSettings } = useFinance();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  // Check if the current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menu items
  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/transactions", label: "Transações" },
    { path: "/reports", label: "Relatórios" },
    { path: "/settings", label: "Configurações" },
  ];

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </span>
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SidebarTrigger>
        </div>
      )}
      
      <Sidebar className="border-r">
        <SidebarHeader className="px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">MEI</span>
            </div>
            <span className="font-semibold text-lg">MEI Finanças</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={cn(
                        isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Plano</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="rounded-md bg-sidebar-accent px-3 py-2 text-sidebar-accent-foreground">
                  <p className="text-xs font-medium">Plano atual:</p>
                  <p className="font-semibold">{userSettings.plan === 'free' ? 'Gratuito' : 'Premium'}</p>
                  
                  {userSettings.plan === 'free' && (
                    <div className="mt-2">
                      <p className="text-xs mb-1">
                        {userSettings.transactionCountThisMonth} / {userSettings.transactionLimit} lançamentos
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-sidebar-border overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (userSettings.transactionCountThisMonth / userSettings.transactionLimit) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {userSettings.plan === 'free' && (
                  <Button 
                    className="w-full mt-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    size="sm"
                    onClick={() => navigate('/upgrade')}
                  >
                    Fazer upgrade
                  </Button>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupContent className="mt-auto">
              <div className="px-3 py-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
