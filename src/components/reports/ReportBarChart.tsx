
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ReportBarChart() {
  const { filteredTransactions } = useFinance();
  
  // Group transactions by date and calculate totals
  const transactionsByDate = filteredTransactions.reduce((acc: Record<string, {date: string, income: number, expense: number}>, transaction) => {
    const dateStr = new Date(transaction.date).toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        income: 0,
        expense: 0
      };
    }
    
    if (transaction.type === 'income') {
      acc[dateStr].income += transaction.amount;
    } else {
      acc[dateStr].expense += transaction.amount;
    }
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  const chartData = Object.values(transactionsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      // Format date to display only day and month
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));
  
  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm h-96">
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Receitas e despesas ao longo do período</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Sem dados disponíveis para o período selecionado</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
        <CardDescription>Receitas e despesas ao longo do período</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `R$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="income" name="Receitas" fill="#10B981" />
              <Bar dataKey="expense" name="Despesas" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
