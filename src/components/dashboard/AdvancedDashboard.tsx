import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from "lucide-react";
import { TransactionChart } from "./TransactionChart";
import { TransactionsTable } from "./TransactionsTable";

export function AdvancedDashboard() {
  const { calculateBalance, calculateTotalByType, filteredTransactions, getCategoryBreakdown } = useFinance();
  
  const balance = calculateBalance();
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  const profit = totalIncome - totalExpense;
  
  // Calculate growth metrics
  const avgIncome = filteredTransactions.length > 0 
    ? totalIncome / Math.max(1, filteredTransactions.filter(t => t.type === 'entrada').length)
    : 0;
  const avgExpense = filteredTransactions.length > 0 
    ? totalExpense / Math.max(1, filteredTransactions.filter(t => t.type === 'saida').length)
    : 0;
  
  // Get top categories
  const topIncomeCategories = getCategoryBreakdown('entrada').slice(0, 3);
  const topExpenseCategories = getCategoryBreakdown('saida').slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Premium Master
          </h1>
          <p className="text-muted-foreground mt-1">Análise avançada e insights detalhados</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">Modo Avançado</span>
        </div>
      </div>
      
      {/* Advanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? 'Patrimônio positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-income bg-gradient-to-br from-income/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-income">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Média: {formatCurrency(avgIncome)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-expense bg-gradient-to-br from-expense/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Média: {formatCurrency(avgExpense)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Lucro/Prejuízo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(profit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Margem: {totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-income" />
              Top Categorias de Receita
            </CardTitle>
            <CardDescription>Suas principais fontes de renda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIncomeCategories.length > 0 ? (
              topIncomeCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-income/5 rounded-lg border border-income/10">
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.percent.toFixed(1)}% do total</p>
                  </div>
                  <p className="font-bold text-income">{formatCurrency(cat.value)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma receita no período</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-expense" />
              Top Categorias de Despesa
            </CardTitle>
            <CardDescription>Onde você mais gasta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topExpenseCategories.length > 0 ? (
              topExpenseCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-expense/5 rounded-lg border border-expense/10">
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.percent.toFixed(1)}% do total</p>
                  </div>
                  <p className="font-bold text-expense">{formatCurrency(cat.value)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa no período</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Evolução de Receitas</CardTitle>
            <CardDescription>Análise detalhada de entradas</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionChart type="entrada" />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Evolução de Despesas</CardTitle>
            <CardDescription>Análise detalhada de saídas</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionChart type="saida" />
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
