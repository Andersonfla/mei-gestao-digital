
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          {type === 'entrada' ? 'Receitas por Categoria' : 'Despesas por Categoria'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => {
                  // Convert percent to number if it's not already and then use toFixed
                  const percentValue = typeof percent === 'number' ? percent : parseFloat(percent.toString());
                  return `${name}: ${(percentValue * 100).toFixed(0)}%`;
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  // Convert value to number if it's not already and then use toFixed
                  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                  return [`R$ ${numValue.toFixed(2)}`, 'Valor'];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
