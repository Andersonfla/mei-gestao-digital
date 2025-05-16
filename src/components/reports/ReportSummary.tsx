
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";

export function ReportSummary() {
  const { calculateTotalByType } = useFinance();
  
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription>Relatório do período selecionado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Receitas</h4>
            <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Despesas</h4>
            <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Lucro/Prejuízo</h4>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Margem</h4>
              <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-income' : 'text-expense'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
