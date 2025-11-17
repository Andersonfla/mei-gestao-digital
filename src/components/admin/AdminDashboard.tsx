import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserStats } from "@/services/adminUsersService";
import { getTransactionStats } from "@/services/adminTransactionsService";
import { Users, UserCheck, Crown, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminDashboard() {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    masterUsers: 0,
    adminUsers: 0,
    lastTransaction: null as string | null,
  });

  const [transStats, setTransStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const users = await getUserStats();
      const trans = await getTransactionStats();
      setUserStats(users);
      setTransStats(trans);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Geral</h2>
        <p className="text-muted-foreground">Visão geral da plataforma MEI Finanças</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Gratuito</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.freeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalUsers > 0 
                ? `${((userStats.freeUsers / userStats.totalUsers) * 100).toFixed(1)}% do total`
                : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalUsers > 0 
                ? `${((userStats.premiumUsers / userStats.totalUsers) * 100).toFixed(1)}% do total`
                : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Master</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.masterUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalUsers > 0 
                ? `${((userStats.masterUsers / userStats.totalUsers) * 100).toFixed(1)}% do total`
                : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Lançamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.lastTransaction
                ? format(new Date(userStats.lastTransaction), "dd/MM/yy", { locale: ptBR })
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.lastTransaction
                ? format(new Date(userStats.lastTransaction), "HH:mm", { locale: ptBR })
                : "Nenhum lançamento"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.adminUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.totalUsers > 0 
                ? `${((userStats.adminUsers / userStats.totalUsers) * 100).toFixed(1)}% do total`
                : '0% do total'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Estatísticas de Lançamentos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lançamentos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registros na plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(transStats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receitas totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(transStats.totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Despesas totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Geral</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${transStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(transStats.balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entradas - Saídas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
