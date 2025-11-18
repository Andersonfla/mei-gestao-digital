
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
  SidebarTrigger,
  useSidebar
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
import { isUserAdmin } from "@/services/adminService";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminSupportNotifications } from "@/hooks/useAdminSupportNotifications";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSettings } = useFinance();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { unreadCount } = useAdminSupportNotifications();

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

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdmin();
  }, [user]);

  // Check if the current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menu items with updated paths
  const baseMenuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/transacoes", label: "Transações" },
    { path: "/relatorios", label: "Relatórios" },
    { path: "/configuracoes", label: "Configurações" },
  ];
  
  // Add Premium Master exclusive items
  const premiumMasterMenuItems = userSettings?.plan === 'master' 
    ? [
        { path: "/metas-financeiras", label: "Metas Financeiras" },
        { path: "/analise-automatica", label: "Análise Automática" },
        { path: "/transacoes-recorrentes", label: "Transações Recorrentes" },
      ]
    : [];
  
  // Add admin-only Webhooks item
  const adminMenuItems = isAdmin 
    ? [{ path: "/admin/webhooks", label: "Webhooks Kiwify" }] 
    : [];
  
  // Add Premium menu item for premium users
  const premiumMenuItem = { path: "/premium", label: "Área Premium" };
  
  // Build menu items based on user plan
  let displayMenuItems = [...baseMenuItems];
  
  // Insert Premium area after Dashboard for premium/master users
  if (userSettings?.plan === 'premium' || userSettings?.plan === 'master') {
    displayMenuItems = [
      baseMenuItems[0], // Dashboard
      premiumMenuItem, // Premium area
      ...baseMenuItems.slice(1, 3), // Transações, Relatórios
      ...premiumMasterMenuItems, // Metas Financeiras e Análise (only for master)
      { path: "/suporte-prioritario", label: "Suporte Prioritário" }, // Support for premium/master
      baseMenuItems[3], // Configurações
      ...adminMenuItems // Admin items if applicable
    ];
  } else {
    displayMenuItems = [...baseMenuItems, ...adminMenuItems];
  }

  return (
    <>
      {isMobile && (
        <div className="fixed top-3 left-3 z-50">
          <SidebarTrigger>
            <Button 
              variant="default" 
              size="icon" 
              className="h-12 w-12 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm bg-primary border-2 border-primary-light"
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </span>
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SidebarTrigger>
        </div>
      )}
      
      <Sidebar className="border-r border-sidebar-border/50 bg-sidebar backdrop-blur-xl">
        <SidebarHeader className="px-6 py-6 border-b border-sidebar-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <img 
                src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
                alt="MEI Finanças" 
                className="h-6 w-auto"
              />
            </div>
            <span className="font-bold text-xl text-sidebar-foreground tracking-tight">MEI Finanças</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarGroupContent>
              {/* User Profile Display */}
              <div className="px-3 py-4 mb-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 backdrop-blur-sm border border-sidebar-border/30">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-sidebar-foreground">
                      {userName}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 font-medium">
                      {userSettings?.plan === 'master' ? '✨ Premium Master' : userSettings?.plan === 'premium' ? '⭐ Premium Pro' : '🎯 Gratuito'}
                    </p>
                  </div>
                </div>
              </div>

                <SidebarMenu className="space-y-1">
                {displayMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={cn(
                        "rounded-lg transition-all duration-200 h-11",
                        isActive(item.path) 
                          ? "bg-primary text-white font-semibold shadow-md hover:bg-primary/90" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground font-medium"
                      )}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold">Plano & Ações</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-3 space-y-3">
                <div className="rounded-xl bg-sidebar-accent/30 backdrop-blur-sm px-4 py-3 text-sidebar-foreground border border-sidebar-border/20">
                  <p className="text-xs font-medium text-sidebar-foreground/70 mb-1">Plano atual:</p>
                  <p className="font-bold text-base">
                    {userSettings.plan === 'free' ? '🎯 Gratuito' : 
                     userSettings.plan === 'master' ? '✨ Premium Master' : '⭐ Premium'}
                  </p>
                  
                  {/* Use the TransactionLimitIndicator component */}
                  <TransactionLimitIndicator userSettings={userSettings} />
                </div>
                
                {userSettings.plan === 'free' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                    size="lg"
                    onClick={() => {
                      navigate('/upgrade');
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    ⚡ Fazer Upgrade
                  </Button>
                )}

                {/* Admin Panel Access */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full border-2 border-primary/30 hover:border-primary hover:bg-primary/5 font-semibold relative"
                    size="lg"
                    onClick={() => {
                      navigate("/admin");
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Painel Admin
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-2 px-2 font-bold"
                      >
                        {unreadCount}
                      </Badge>
                    )}
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
                  className="w-full justify-start text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 font-medium"
                  size="lg"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
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
