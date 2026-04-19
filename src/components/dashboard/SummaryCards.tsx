import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function SummaryCards() {
  const { calculateBalance, calculateTotalByType } = useFinance();

  const balance = calculateBalance();
  const totalIncome = calculateTotalByType("entrada");
  const totalExpense = calculateTotalByType("saida");
  const profit = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
      {/* Saldo — featured */}
      <Card
        className="sm:col-span-2 lg:col-span-6 relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/[0.06] via-card to-card animate-scale-in transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
              <p className="text-xs text-muted-foreground/80">Resultado do período</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p
            className={`text-4xl md:text-5xl font-semibold tracking-tight ${
              balance >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>

      <MetricCard
        label="Receitas"
        value={totalIncome}
        icon={<TrendingUp className="w-4 h-4 text-success" />}
        iconBg="bg-success/10"
        valueClass="text-success"
        delay={80}
      />
      <MetricCard
        label="Despesas"
        value={totalExpense}
        icon={<TrendingDown className="w-4 h-4 text-destructive" />}
        iconBg="bg-destructive/10"
        valueClass="text-destructive"
        delay={140}
      />
      <MetricCard
        label="Lucro/Prejuízo"
        value={profit}
        icon={
          <TrendingUp
            className={`w-4 h-4 ${profit >= 0 ? "text-success" : "text-destructive"}`}
          />
        }
        iconBg={profit >= 0 ? "bg-success/10" : "bg-destructive/10"}
        valueClass={profit >= 0 ? "text-success" : "text-destructive"}
        delay={200}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  valueClass,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  valueClass: string;
  delay: number;
}) {
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
        <p className={`text-2xl font-semibold tracking-tight ${valueClass}`}>
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}
