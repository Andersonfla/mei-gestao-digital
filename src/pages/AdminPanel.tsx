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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Admin - MEI Finanças</h1>
              <p className="text-sm text-muted-foreground">Logado como: {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-[900px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Lançamentos
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2 relative">
              <MessageSquare className="h-4 w-4" />
              Chat
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-1 h-5 px-2 text-xs animate-pulse"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contato" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

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
