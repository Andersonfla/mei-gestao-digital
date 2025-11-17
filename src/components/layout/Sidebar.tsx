
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
        <div className="fixed top-2 left-2 z-50 bg-background/80 backdrop-blur-sm rounded-md">
          <SidebarTrigger>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0 shadow-md">
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
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
            <img 
              src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
              alt="MEI Finanças" 
              className="h-8 w-auto"
            />
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
                      {userSettings?.plan === 'master' ? 'Premium Master' : userSettings?.plan === 'premium' ? 'Premium Pro' : 'Plano Gratuito'}
                    </p>
                  </div>
                </div>
              </div>

                <SidebarMenu>
                {displayMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={cn(
                        isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
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
          
          <SidebarGroup>
            <SidebarGroupLabel>Plano</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="rounded-md bg-sidebar-accent px-3 py-2 text-sidebar-accent-foreground">
                  <p className="text-xs font-medium">Plano atual:</p>
                  <p className="font-semibold">
                    {userSettings.plan === 'free' ? 'Gratuito' : 
                     userSettings.plan === 'master' ? 'Premium Master' : 'Premium'}
                  </p>
                  
                  {/* Use the TransactionLimitIndicator component */}
                  <TransactionLimitIndicator userSettings={userSettings} />
                </div>
                
                {userSettings.plan === 'free' && (
                  <Button 
                    className="w-full mt-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    size="sm"
                    onClick={() => {
                      navigate('/upgrade');
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    Fazer upgrade
                  </Button>
                )}

                {/* Admin Panel Access */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start gap-2 relative"
                    onClick={() => {
                      navigate("/admin");
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    Painel Admin
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
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
