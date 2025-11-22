
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function TransactionChart({ type }: { type: 'entrada' | 'saida' }) {
  const { getCategoryBreakdown } = useFinance();
  const data = getCategoryBreakdown(type);
  
  // Colors for pie chart
  const COLORS = type === 'entrada'
    ? ['#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0']
    : ['#EF4444', '#DC2626', '#F87171', '#FCA5A5', '#FECACA'];
  
  if (data.length === 0) {
    return (
      <Card className="shadow-sm h-80">
        <CardHeader>
          <CardTitle className="text-lg">
            {type === 'entrada' ? 'Receitas por Categoria' : 'Despesas por Categoria'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
