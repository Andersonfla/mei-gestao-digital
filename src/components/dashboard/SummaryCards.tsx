
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";

export function SummaryCards() {
  const { calculateTotalByType } = useFinance();
  
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  const profit = totalIncome - totalExpense;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-success tracking-tight">{formatCurrency(totalIncome)}</p>
          <div className="mt-2 h-1 w-16 bg-success/20 rounded-full">
            <div className="h-full w-3/4 bg-success rounded-full" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-destructive tracking-tight">{formatCurrency(totalExpense)}</p>
          <div className="mt-2 h-1 w-16 bg-destructive/20 rounded-full">
            <div className="h-full w-3/4 bg-destructive rounded-full" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${profit >= 0 ? 'from-primary/5 to-primary/10' : 'from-destructive/5 to-destructive/10'} opacity-0 group-hover:opacity-100`} />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lucro/Prejuízo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold tracking-tight ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(profit)}
          </p>
          <div className={`mt-2 h-1 w-16 rounded-full ${profit >= 0 ? 'bg-primary/20' : 'bg-destructive/20'}`}>
            <div className={`h-full w-3/4 rounded-full ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
