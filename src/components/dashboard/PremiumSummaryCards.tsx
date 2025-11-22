import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function PremiumSummaryCards() {
  const { calculateBalance, calculateTotalByType, transactions, filterDates } = useFinance();
  
  const balance = calculateBalance();
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  const profit = totalIncome - totalExpense;
  
  // Generate sparkline data for trends (last 7 periods)
  const generateSparklineData = (type: 'entrada' | 'saida' | 'balance') => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= filterDates.startDate && date <= filterDates.endDate;
    });
    
    // Group by day and calculate values
    const grouped = filtered.reduce((acc, t) => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'entrada') {
        acc[dateKey].income += Number(t.value);
      } else {
        acc[dateKey].expense += Number(t.value);
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);
    
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);
    
    return sorted.map(([date, values]) => ({
      date,
      value: type === 'entrada' ? values.income : type === 'saida' ? values.expense : values.income - values.expense
    }));
  };
  
  const incomeSparkline = generateSparklineData('entrada');
  const expenseSparkline = generateSparklineData('saida');
  const balanceSparkline = generateSparklineData('balance');
  const profitSparkline = balanceSparkline;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Balance Card */}
      <Card className="relative overflow-hidden group shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Saldo Total
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold tracking-tight mb-2 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(balance)}
          </p>
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceSparkline}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={balance >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {balance >= 0 ? '↗ Patrimônio positivo' : '↘ Saldo negativo'}
          </p>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="relative overflow-hidden group shadow-lg border-l-4 border-l-income bg-gradient-to-br from-income/10 via-income/5 to-transparent hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-income/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Receitas
            </CardTitle>
            <div className="p-2 rounded-lg bg-income/10">
              <TrendingUp className="w-4 h-4 text-income" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-income tracking-tight mb-2">
            {formatCurrency(totalIncome)}
          </p>
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeSparkline}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--income))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ↗ Tendência de entradas
          </p>
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="relative overflow-hidden group shadow-lg border-l-4 border-l-expense bg-gradient-to-br from-expense/10 via-expense/5 to-transparent hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-expense/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Despesas
            </CardTitle>
            <div className="p-2 rounded-lg bg-expense/10">
              <TrendingDown className="w-4 h-4 text-expense" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-expense tracking-tight mb-2">
            {formatCurrency(totalExpense)}
          </p>
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenseSparkline}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--expense))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ↘ Tendência de saídas
          </p>
        </CardContent>
      </Card>

      {/* Profit Card */}
      <Card className="relative overflow-hidden group shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Lucro/Prejuízo
            </CardTitle>
            <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-income/10' : 'bg-expense/10'}`}>
              <Target className={`w-4 h-4 ${profit >= 0 ? 'text-income' : 'text-expense'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold tracking-tight mb-2 ${profit >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(profit)}
          </p>
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitSparkline}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={profit >= 0 ? 'hsl(var(--income))' : 'hsl(var(--expense))'} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Margem: {totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
