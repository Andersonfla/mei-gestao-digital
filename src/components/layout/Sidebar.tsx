
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
import { LogOut, User } from "lucide-react";
import { TransactionLimitIndicator } from "@/components/transactions/TransactionLimitIndicator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSettings } = useFinance();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const [userName, setUserName] = useState("");

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();
            
          if (error) throw error;
          if (profile?.name) {
            setUserName(profile.name);
          } else {
            // Fallback to email if name is not available
            setUserName(user.email?.split('@')[0] || "Usuário");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to email if there's an error
          setUserName(user.email?.split('@')[0] || "Usuário");
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Check if the current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menu items - Updated to use /app prefix
  const menuItems = [
    { path: "/app", label: "Dashboard" },
    { path: "/app/transactions", label: "Transações" },
    { path: "/app/reports", label: "Relatórios" },
    { path: "/app/settings", label: "Configurações" },
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
              {/* User Profile Display */}
              <div className="px-3 py-3 mb-4">
                <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <User size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {userName}
                    </p>
                    <p className="text-xs opacity-70">
                      {userSettings?.plan === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
                    </p>
                  </div>
                </div>
              </div>

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
                  
                  {/* Use the TransactionLimitIndicator component */}
                  <TransactionLimitIndicator userSettings={userSettings} />
                </div>
                
                {userSettings.plan === 'free' && (
                  <Button 
                    className="w-full mt-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    size="sm"
                    onClick={() => navigate('/app/upgrade')}
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
