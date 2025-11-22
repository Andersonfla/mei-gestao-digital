import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { format, subYears, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function YearOverYearComparison() {
  const { transactions, filterDates } = useFinance();
  
  // Get current period and same period last year
  const currentStart = filterDates.startDate;
  const currentEnd = filterDates.endDate;
  const lastYearStart = subYears(currentStart, 1);
  const lastYearEnd = subYears(currentEnd, 1);
  
  // Filter transactions for both periods
  const currentPeriodTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= currentStart && date <= currentEnd;
  });
  
  const lastYearTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= lastYearStart && date <= lastYearEnd;
  });
  
  // Calculate totals
  const currentIncome = currentPeriodTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + Number(t.value), 0);
  
  const currentExpense = currentPeriodTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + Number(t.value), 0);
  
  const lastYearIncome = lastYearTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + Number(t.value), 0);
  
  const lastYearExpense = lastYearTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + Number(t.value), 0);
  
  // Calculate growth
  const incomeGrowth = lastYearIncome > 0 
    ? ((currentIncome - lastYearIncome) / lastYearIncome) * 100 
    : 0;
  
  const expenseGrowth = lastYearExpense > 0 
    ? ((currentExpense - lastYearExpense) / lastYearExpense) * 100 
    : 0;
  
  // Prepare chart data
  const chartData = [
    {
      period: format(lastYearStart, "MMM/yy", { locale: ptBR }),
      receitas: lastYearIncome,
      despesas: lastYearExpense,
      year: 'Ano Anterior'
    },
    {
      period: format(currentStart, "MMM/yy", { locale: ptBR }),
      receitas: currentIncome,
      despesas: currentExpense,
      year: 'Ano Atual'
    }
  ];

  const hasData = currentIncome > 0 || currentExpense > 0 || lastYearIncome > 0 || lastYearExpense > 0;

  if (!hasData) {
    return (
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Comparativo Anual
          </CardTitle>
          <CardDescription>Comparação com o mesmo período do ano anterior</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Sem dados disponíveis para comparação</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Comparativo Anual (YoY)
        </CardTitle>
        <CardDescription>
          Análise de crescimento vs. mesmo período do ano anterior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="hsl(var(--income))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--income))', r: 6 }}
                name="Receitas"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="hsl(var(--expense))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--expense))', r: 6 }}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${incomeGrowth >= 0 ? 'bg-income/10 border-income/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {incomeGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-income" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <p className="text-xs font-medium text-muted-foreground">Crescimento de Receitas</p>
            </div>
            <p className={`text-2xl font-bold ${incomeGrowth >= 0 ? 'text-income' : 'text-destructive'}`}>
              {incomeGrowth >= 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(currentIncome)} vs {formatCurrency(lastYearIncome)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${expenseGrowth <= 0 ? 'bg-income/10 border-income/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {expenseGrowth <= 0 ? (
                <TrendingDown className="w-4 h-4 text-income" />
              ) : (
                <TrendingUp className="w-4 h-4 text-destructive" />
              )}
              <p className="text-xs font-medium text-muted-foreground">Variação de Despesas</p>
            </div>
            <p className={`text-2xl font-bold ${expenseGrowth <= 0 ? 'text-income' : 'text-destructive'}`}>
              {expenseGrowth >= 0 ? '+' : ''}{expenseGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(currentExpense)} vs {formatCurrency(lastYearExpense)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
