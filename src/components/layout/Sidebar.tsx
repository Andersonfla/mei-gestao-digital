import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { useAuth } from "@/contexts";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LogOut,
  LayoutDashboard,
  ArrowLeftRight,
  FileBarChart,
  Sparkles,
  Calculator,
  Brain,
  Target,
  Repeat,
  Headphones,
  Settings as SettingsIcon,
  Shield,
  Zap,
  Crown,
} from "lucide-react";
import { TransactionLimitIndicator } from "@/components/transactions/TransactionLimitIndicator";
import { useEffect, useState, type ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isUserAdmin } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";
import { useAdminSupportNotifications } from "@/hooks/useAdminSupportNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSettings } = useFinance();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const { state, setOpenMobile, setOpen } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { unreadCount } = useAdminSupportNotifications();

  const { effectivePlan, isPremium: isPremiumOrMaster, can } = usePlanGuard();

  // Profile fetch + realtime
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const fetchUserProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setUserName(profile?.name || user.email?.split("@")[0] || "Usuário");
        setAvatarUrl(profile?.avatar_url || null);
      } catch {
        if (mounted) setUserName(user.email?.split("@")[0] || "Usuário");
      }
    };
    fetchUserProfile();

    const channel = supabase
      .channel("profile-changes-sidebar")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          if (!mounted) return;
          if (payload.new.name) setUserName(payload.new.name);
          setAvatarUrl(payload.new.avatar_url || null);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) setIsAdmin(await isUserAdmin());
    };
    checkAdmin();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  // Grouped navigation respecting plan permissions
  const groups: NavGroup[] = [
    {
      id: "financeiro",
      label: "Financeiro",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/transacoes", label: "Transações", icon: ArrowLeftRight },
        { path: "/relatorios", label: "Relatórios", icon: FileBarChart },
        ...(can("recurring_transactions")
          ? [{ path: "/transacoes-recorrentes", label: "Recorrentes", icon: Repeat }]
          : []),
      ],
    },
    {
      id: "inteligencia",
      label: "Inteligência",
      items: [
        ...(can("pricing_module")
          ? [{ path: "/precificacao", label: "Precificação", icon: Calculator }]
          : []),
        ...(can("auto_analysis")
          ? [{ path: "/analise-automatica", label: "Análise Automática", icon: Brain }]
          : []),
        ...(can("financial_goals")
          ? [{ path: "/metas-financeiras", label: "Metas", icon: Target }]
          : []),
        ...(isPremiumOrMaster
          ? [{ path: "/premium", label: "Área Premium", icon: Sparkles }]
          : []),
      ],
    },
    {
      id: "conta",
      label: "Conta",
      items: [
        ...(can("priority_support")
          ? [{ path: "/suporte-prioritario", label: "Suporte Prioritário", icon: Headphones }]
          : []),
        { path: "/configuracoes", label: "Configurações", icon: SettingsIcon },
      ],
    },
  ].filter((g) => g.items.length > 0);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  // Hover-to-expand on desktop only
  const handleMouseEnter = () => {
    if (!isMobile && collapsed) setOpen(true);
  };
  const handleMouseLeave = () => {
    if (!isMobile && !collapsed) setOpen(false);
  };

  const planLabel =
    effectivePlan === "master"
      ? "Premium Master"
      : effectivePlan === "premium"
      ? "Premium"
      : "Gratuito";
  const planIcon = effectivePlan === "master" ? Crown : effectivePlan === "premium" ? Sparkles : Zap;
  const PlanIcon = planIcon;

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border/40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Brand */}
        <SidebarHeader className="border-b border-sidebar-border/30">
          <div className={cn("flex items-center gap-3 px-2 py-3", collapsed && "justify-center px-0")}>
            <div className="w-9 h-9 rounded-xl bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
              <img
                src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png"
                alt="MEI Finanças"
                className="h-5 w-auto"
              />
            </div>
            {!collapsed && (
              <span className="font-semibold text-base text-sidebar-foreground tracking-tight whitespace-nowrap">
                MEI Finanças
              </span>
            )}
          </div>

          {/* User chip */}
          <div className={cn("px-2 pb-3", collapsed && "px-0 flex justify-center")}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg bg-sidebar-accent/50 ring-1 ring-sidebar-border/30 transition-all",
                collapsed ? "p-1.5" : "p-2.5"
              )}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                  {userName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-sidebar-foreground leading-tight">
                    {userName}
                  </p>
                  <p className="text-[11px] text-sidebar-foreground/60 flex items-center gap-1 mt-0.5">
                    <PlanIcon className="h-3 w-3" />
                    {planLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          {groups.map((group) => (
            <SidebarGroup key={group.id}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/45 font-semibold px-2">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const button = (
                      <SidebarMenuButton
                        onClick={() => handleNavigate(item.path)}
                        isActive={active}
                        tooltip={collapsed ? item.label : undefined}
                        className={cn(
                          "h-9 rounded-md transition-all duration-200 group/item",
                          active
                            ? "bg-primary/15 text-sidebar-foreground font-medium shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary))]"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover/item:text-sidebar-foreground"
                          )}
                        />
                        <span className="text-sm">{item.label}</span>
                      </SidebarMenuButton>
                    );
                    return (
                      <SidebarMenuItem key={item.path}>{button}</SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/30 gap-2">
          {/* Plan card / upgrade CTA */}
          {!collapsed ? (
            <div className="px-2 pt-2 space-y-2">
              <div className="rounded-lg bg-sidebar-accent/40 ring-1 ring-sidebar-border/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <PlanIcon className="h-3.5 w-3.5 text-sidebar-primary" />
                  <p className="text-xs font-medium text-sidebar-foreground/80">{planLabel}</p>
                </div>
                <TransactionLimitIndicator userSettings={userSettings} />
              </div>

              {effectivePlan === "free" && (
                <Button
                  size="sm"
                  className="w-full h-9 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleNavigate("/upgrade")}
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Fazer Upgrade
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 bg-transparent border-sidebar-border/50 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground relative"
                  onClick={() => handleNavigate("/admin")}
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Painel Admin
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto px-1.5 h-5 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          ) : (
            // Collapsed: only icon-buttons
            <div className="px-2 pt-2 space-y-1 flex flex-col items-center">
              {effectivePlan === "free" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-9 w-9 bg-gradient-to-br from-primary to-primary-dark text-white"
                      onClick={() => handleNavigate("/upgrade")}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Fazer Upgrade</TooltipContent>
                </Tooltip>
              )}
              {isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent relative"
                      onClick={() => handleNavigate("/admin")}
                    >
                      <Shield className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Painel Admin {unreadCount > 0 && `(${unreadCount})`}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Sign out */}
          <div className={cn("px-2 pb-2", collapsed && "flex justify-center")}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 justify-start text-sidebar-foreground/75 hover:text-destructive hover:bg-destructive/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
