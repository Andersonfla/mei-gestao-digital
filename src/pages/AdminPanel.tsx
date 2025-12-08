import { useState } from "react";
import { useAuth } from "@/contexts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { AdminSupport } from "@/components/admin/AdminSupport";
import AdminContactMessages from "@/components/admin/AdminContactMessages";
import { LayoutDashboard, Users, Receipt, FileText, MessageSquare, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminSupportNotifications } from "@/hooks/useAdminSupportNotifications";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { unreadCount } = useAdminSupportNotifications();

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                Painel Admin - MEI Finanças
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Logado como: {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 w-full">
          {/* Tabs responsivas - scroll horizontal no mobile */}
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max sm:grid sm:grid-cols-6 sm:w-full lg:max-w-[900px] gap-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">Dashboard</span>
                <span className="xs:hidden sm:hidden">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lançamentos</span>
                <span className="sm:hidden">Lanç.</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap relative">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Chat</span>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-1 h-4 sm:h-5 px-1 sm:px-2 text-[10px] sm:text-xs animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="contato" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Contato</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Logs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <AdminTransactions />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <AdminSupport />
          </TabsContent>

          <TabsContent value="contato" className="space-y-6">
            <AdminContactMessages />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdminLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
