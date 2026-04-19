import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function PremiumSummaryCards() {
  const { calculateBalance, calculateTotalByType, transactions, filterDates } = useFinance();

  const balance = calculateBalance();
  const totalIncome = calculateTotalByType("entrada");
  const totalExpense = calculateTotalByType("saida");
  const profit = totalIncome - totalExpense;

  // Sparkline data
  const generateSparklineData = (type: "entrada" | "saida" | "balance") => {
    const filtered = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= filterDates.startDate && date <= filterDates.endDate;
    });

    const grouped = filtered.reduce((acc, t) => {
      const dateKey = new Date(t.date).toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = { income: 0, expense: 0 };
      if (t.type === "entrada") acc[dateKey].income += Number(t.value);
      else acc[dateKey].expense += Number(t.value);
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);

    return sorted.map(([date, values]) => ({
      date,
      value:
        type === "entrada"
          ? values.income
          : type === "saida"
          ? values.expense
          : values.income - values.expense,
    }));
  };

  const incomeSparkline = generateSparklineData("entrada");
  const expenseSparkline = generateSparklineData("saida");
  const balanceSparkline = generateSparklineData("balance");
  const profitSparkline = balanceSparkline;

  const balanceColor = balance >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const profitColor = profit >= 0 ? "hsl(var(--income))" : "hsl(var(--expense))";

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
      {/* Saldo Total — featured (spans 3 of 6) */}
      <Card
        className="md:col-span-3 relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/[0.06] via-card to-card animate-scale-in transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ animationDelay: "0ms" }}
      >
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
        />
        <CardContent className="relative p-6 md:p-7">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                Saldo Total
              </p>
              <p className="text-xs text-muted-foreground/80">Patrimônio do período</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>

          <p
            className={`text-4xl md:text-5xl font-semibold tracking-tight mb-3 ${
              balance >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatCurrency(balance)}
          </p>

          <div className="h-14 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceSparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={balanceColor}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {balance >= 0 ? "↗ Patrimônio positivo" : "↘ Saldo negativo"}
          </p>
        </CardContent>
      </Card>

      {/* Receitas */}
      <SecondaryMetricCard
        label="Receitas"
        value={totalIncome}
        icon={<TrendingUp className="w-4 h-4 text-income" />}
        iconBg="bg-income/10"
        valueClassName="text-income"
        sparkline={incomeSparkline}
        sparklineColor="hsl(var(--income))"
        caption="↗ Tendência de entradas"
        delay={80}
      />

      {/* Despesas */}
      <SecondaryMetricCard
        label="Despesas"
        value={totalExpense}
        icon={<TrendingDown className="w-4 h-4 text-expense" />}
        iconBg="bg-expense/10"
        valueClassName="text-expense"
        sparkline={expenseSparkline}
        sparklineColor="hsl(var(--expense))"
        caption="↘ Tendência de saídas"
        delay={140}
      />

      {/* Lucro / Prejuízo */}
      <SecondaryMetricCard
        label="Lucro/Prejuízo"
        value={profit}
        icon={
          <Target
            className={`w-4 h-4 ${profit >= 0 ? "text-income" : "text-expense"}`}
          />
        }
        iconBg={profit >= 0 ? "bg-income/10" : "bg-expense/10"}
        valueClassName={profit >= 0 ? "text-income" : "text-expense"}
        sparkline={profitSparkline}
        sparklineColor={profitColor}
        caption={`Margem: ${
          totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0
        }%`}
        delay={200}
      />
    </div>
  );
}

interface SecondaryMetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  valueClassName: string;
  sparkline: { date: string; value: number }[];
  sparklineColor: string;
  caption: string;
  delay: number;
}

function SecondaryMetricCard({
  label,
  value,
  icon,
  iconBg,
  valueClassName,
  sparkline,
  sparklineColor,
  caption,
  delay,
}: SecondaryMetricCardProps) {
  return (
    <Card
      className="lg:col-span-2 border-border/60 animate-scale-in transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            {label}
          </p>
          <div className={`p-1.5 rounded-lg ${iconBg}`}>{icon}</div>
        </div>

        <p className={`text-2xl font-semibold tracking-tight mb-2 ${valueClassName}`}>
          {formatCurrency(value)}
        </p>

        <div className="h-10 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-muted-foreground mt-1.5">{caption}</p>
      </CardContent>
    </Card>
  );
}
