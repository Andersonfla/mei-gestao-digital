
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/formatters";

export function SummaryCards() {
  const { calculateTotalByType } = useFinance();
  
  const totalIncome = calculateTotalByType('income');
  const totalExpense = calculateTotalByType('expense');
  const profit = totalIncome - totalExpense;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm border-l-4 border-l-income">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-muted-foreground">Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-l-4 border-l-expense">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-muted-foreground">Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-l-4" style={{ borderLeftColor: profit >= 0 ? '#10B981' : '#EF4444' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-muted-foreground">Lucro/Prejuízo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(profit)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
