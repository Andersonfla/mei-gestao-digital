import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { TransactionChart } from "./TransactionChart";
import { TransactionsTable } from "./TransactionsTable";
import { PremiumSummaryCards } from "./PremiumSummaryCards";
import { ProfitMarginByCategory } from "./ProfitMarginByCategory";
import { BreakEvenPoint } from "./BreakEvenPoint";
import { YearOverYearComparison } from "./YearOverYearComparison";

export function AdvancedDashboard() {
  return (
    <div className="space-y-10">
      {/* Header — refined, less heavy */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 animate-slide-up">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Premium Master
          </p>
          <h1 className="text-3xl md:text-[2rem] font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Análise avançada e insights exclusivos para o seu MEI
          </p>
        </div>
      </header>

      {/* Level 1 — Key metrics */}
      <section
        className="animate-slide-up"
        style={{ animationDelay: "60ms" }}
      >
        <PremiumSummaryCards />
      </section>

      {/* Level 2 — Analysis */}
      <section className="space-y-4">
        <div
          className="flex items-baseline justify-between animate-slide-up"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Análise
          </h2>
          <span className="text-xs text-muted-foreground">Indicadores de rentabilidade</span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up"
          style={{ animationDelay: "160ms" }}
        >
          <ProfitMarginByCategory />
          <BreakEvenPoint />
        </div>

        <div
          className="animate-slide-up"
          style={{ animationDelay: "220ms" }}
        >
          <YearOverYearComparison />
        </div>
      </section>

      {/* Level 3 — Distributions */}
      <section className="space-y-4">
        <div
          className="flex items-baseline justify-between animate-slide-up"
          style={{ animationDelay: "260ms" }}
        >
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Distribuições
          </h2>
          <span className="text-xs text-muted-foreground">Por categoria</span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BarChart3 className="w-4 h-4 text-income" />
                Receitas por Categoria
              </CardTitle>
              <CardDescription className="text-xs">
                Distribuição detalhada de entradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <TransactionChart type="entrada" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <BarChart3 className="w-4 h-4 text-expense" />
                Despesas por Categoria
              </CardTitle>
              <CardDescription className="text-xs">
                Distribuição detalhada de saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <TransactionChart type="saida" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent transactions */}
      <section
        className="animate-slide-up"
        style={{ animationDelay: "360ms" }}
      >
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Transações Recentes</CardTitle>
            <CardDescription className="text-xs">
              Últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsTable />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
