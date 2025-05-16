
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";

export function BalanceCard() {
  const { calculateBalance } = useFinance();
  const balance = calculateBalance();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground">Saldo Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(balance)}
        </p>
      </CardContent>
    </Card>
  );
}
