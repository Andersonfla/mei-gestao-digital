import { WalletManager } from "@/components/premium-master/WalletManager";
import { CustomCategoryManager } from "@/components/premium-master/CustomCategoryManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Wallet, Tag, FileText, TrendingUp, Database, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { Navigate } from "react-router-dom";

const PremiumMaster = () => {
  const { isPremiumMasterActive, isLoading } = useFinance();

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (!isPremiumMasterActive) {
    return <Navigate to="/upgrade" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Premium Master</h1>
          <p className="text-muted-foreground">
            Acesso total aos recursos mais avançados do MEI Finanças
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <Wallet className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-sm">Carteiras Ilimitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">∞</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Tag className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-sm">Categorias Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">∞</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <FileText className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-sm">Relatórios Fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">DASN</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <TrendingUp className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-sm">Projeção IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3 meses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">
            <Wallet className="w-4 h-4 mr-2" />
            Carteiras
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="w-4 h-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="backups">
            <Database className="w-4 h-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <WalletManager />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CustomCategoryManager />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Fiscais DASN</CardTitle>
              <CardDescription>
                Gere relatórios completos para declaração anual do MEI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backups Automáticos</CardTitle>
              <CardDescription>
                Seus dados protegidos com backups mensais automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PIN de Segurança</CardTitle>
              <CardDescription>
                Configure um PIN de 4 dígitos para proteger seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumMaster;
