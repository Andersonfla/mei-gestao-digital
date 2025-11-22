import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { Target, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function BreakEvenPoint() {
  const { calculateTotalByType, filteredTransactions } = useFinance();
  
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  
  // Calculate break-even point (total expenses needed to cover)
  const breakEvenPoint = totalExpense;
  const currentRevenue = totalIncome;
  const percentageAchieved = breakEvenPoint > 0 ? (currentRevenue / breakEvenPoint) * 100 : 0;
  const stillNeeded = Math.max(0, breakEvenPoint - currentRevenue);
  
  const isBreakEven = currentRevenue >= breakEvenPoint;
  const profitAfterBreakEven = isBreakEven ? currentRevenue - breakEvenPoint : 0;
  
  // Calculate average daily revenue needed to break even by end of period
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.max(1, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRevenueNeeded = stillNeeded / daysRemaining;

  return (
    <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Ponto de Equilíbrio (Break-Even)
        </CardTitle>
        <CardDescription>
          Análise do quanto você precisa faturar para cobrir custos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Break-Even Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ponto de Equilíbrio</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(breakEvenPoint)}</span>
          </div>
          
          <Progress value={Math.min(percentageAchieved, 100)} className="h-3" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Receita Atual</span>
            <span className="font-semibold">{formatCurrency(currentRevenue)}</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-lg border ${isBreakEven ? 'bg-income/10 border-income/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isBreakEven ? (
                <TrendingUp className="w-4 h-4 text-income" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <p className="text-xs font-medium text-muted-foreground">Status</p>
            </div>
            <p className={`text-lg font-bold ${isBreakEven ? 'text-income' : 'text-destructive'}`}>
              {isBreakEven ? 'Alcançado!' : 'Pendente'}
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card/50 border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {isBreakEven ? 'Lucro Acima' : 'Falta Faturar'}
            </p>
            <p className={`text-lg font-bold ${isBreakEven ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(isBreakEven ? profitAfterBreakEven : stillNeeded)}
            </p>
          </div>
        </div>

        {/* Projection */}
        {!isBreakEven && stillNeeded > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Meta diária para alcançar break-even até fim do mês
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">{formatCurrency(dailyRevenueNeeded)}</p>
              <p className="text-xs text-muted-foreground">/ dia ({daysRemaining} dias restantes)</p>
            </div>
          </div>
        )}

        {/* Achievement Message */}
        {isBreakEven && (
          <div className="p-4 rounded-lg bg-income/10 border border-income/20">
            <p className="text-sm font-medium text-income">
              🎉 Parabéns! Você ultrapassou o ponto de equilíbrio em {percentageAchieved.toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
