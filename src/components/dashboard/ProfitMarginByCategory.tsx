import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export function ProfitMarginByCategory() {
  const { getCategoryBreakdown, calculateTotalByType } = useFinance();
  
  const incomeCategories = getCategoryBreakdown('entrada');
  const expenseCategories = getCategoryBreakdown('saida');
  
  // Calculate profit margin by category
  const marginData = incomeCategories.map(income => {
    const expense = expenseCategories.find(e => e.name === income.name);
    const expenseValue = expense ? expense.value : 0;
    const margin = income.value - expenseValue;
    const marginPercent = income.value > 0 ? (margin / income.value) * 100 : 0;
    
    return {
      name: income.name,
      margin,
      marginPercent,
      income: income.value,
      expense: expenseValue
    };
  }).sort((a, b) => b.margin - a.margin).slice(0, 5);
  
  if (marginData.length === 0) {
    return (
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Margem de Lucro por Categoria
          </CardTitle>
          <CardDescription>Análise de rentabilidade por categoria</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Sem dados disponíveis no período</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Margem de Lucro por Categoria
        </CardTitle>
        <CardDescription>
          Identifique seus produtos/serviços mais rentáveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marginData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="margin" radius={[0, 8, 8, 0]}>
                {marginData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.margin >= 0 ? 'hsl(var(--income))' : 'hsl(var(--expense))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {marginData.slice(0, 2).map((cat, idx) => (
            <div key={idx} className="p-3 bg-card rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{cat.name}</p>
              <p className={`text-lg font-bold ${cat.margin >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(cat.margin)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {cat.marginPercent.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
