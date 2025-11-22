import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { Activity, BarChart3 } from "lucide-react";
import { TransactionChart } from "./TransactionChart";
import { TransactionsTable } from "./TransactionsTable";
import { PremiumSummaryCards } from "./PremiumSummaryCards";
import { ProfitMarginByCategory } from "./ProfitMarginByCategory";
import { BreakEvenPoint } from "./BreakEvenPoint";
import { YearOverYearComparison } from "./YearOverYearComparison";

export function AdvancedDashboard() {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Dashboard Premium Master
          </h1>
          <p className="text-muted-foreground mt-1">Análise avançada e insights exclusivos para MEIs</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-lg">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <span className="font-semibold text-primary">Modo Avançado</span>
        </div>
      </div>
      
      {/* Premium Summary Cards with Sparklines */}
      <PremiumSummaryCards />
      
      {/* Advanced Insights - New Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitMarginByCategory />
        <BreakEvenPoint />
      </div>
      
      {/* Year over Year Comparison */}
      <YearOverYearComparison />
      
      {/* Charts Section - Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-l-4 border-l-income">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-income" />
              Receitas por Categoria
            </CardTitle>
            <CardDescription>Distribuição detalhada de entradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TransactionChart type="entrada" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-l-4 border-l-expense">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-expense" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription>Distribuição detalhada de saídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TransactionChart type="saida" />
            </div>
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
