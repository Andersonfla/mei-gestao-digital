import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, DollarSign, BarChart3, AlertTriangle, Award, Receipt } from "lucide-react";
import type { PricingProduct } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { PricingEmptyState } from "./PricingEmptyState";
import { calcTotalCost, calcMarginPercent } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

interface PricingOverviewProps {
  products: PricingProduct[];
  isLoading: boolean;
}

export function PricingOverview({ products, isLoading }: PricingOverviewProps) {
  if (isLoading) return <PricingLoadingSkeleton count={4} />;

  if (products.length === 0) {
    return <PricingEmptyState title="Nenhum produto cadastrado" description="Cadastre seus produtos ou serviços para começar a precificar e acompanhar suas margens de lucro." />;
  }

  const activeProducts = products.filter((p) => p.is_active);
  const enriched = activeProducts.map((p) => {
    const cost = calcTotalCost(p);
    const margin = calcMarginPercent(p.sale_price || 0, cost);
    return { ...p, totalCostVal: cost, margin };
  });

  const avgMargin = enriched.length > 0 ? enriched.reduce((s, p) => s + p.margin, 0) / enriched.length : 0;
  const avgPrice = enriched.length > 0 ? enriched.reduce((s, p) => s + (p.sale_price || 0), 0) / enriched.length : 0;
  const avgCost = enriched.length > 0 ? enriched.reduce((s, p) => s + p.totalCostVal, 0) / enriched.length : 0;
  const lowMarginCount = enriched.filter((p) => p.margin < 20).length;
  const lossCount = enriched.filter((p) => p.margin < 0).length;
  const sorted = [...enriched].sort((a, b) => b.margin - a.margin);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const cards = [
    { title: "Total de Produtos", value: products.length.toString(), subtitle: `${activeProducts.length} ativos`, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { title: "Margem Média", value: `${avgMargin.toFixed(1)}%`, subtitle: "média de todos ativos", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-500/10" },
    { title: "Preço Médio", value: formatCurrency(avgPrice), subtitle: "preço de venda médio", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Custo Médio", value: formatCurrency(avgCost), subtitle: "custo total médio", icon: Receipt, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Maior Margem", value: best ? `${best.margin.toFixed(1)}%` : "—", subtitle: best?.name || "sem dados", icon: Award, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Menor Margem", value: worst ? `${worst.margin.toFixed(1)}%` : "—", subtitle: worst?.name || "sem dados", icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
    { title: "Margem Baixa", value: lowMarginCount.toString(), subtitle: "produtos abaixo de 20%", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Em Prejuízo", value: lossCount.toString(), subtitle: "produtos abaixo do custo", icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(lossCount > 0 || lowMarginCount > 0 || avgMargin < 20) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Alertas Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lossCount > 0 && (
              <p className="text-sm flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span><strong>{lossCount}</strong> produto(s) operando no prejuízo. Revise os preços urgentemente.</span>
              </p>
            )}
            {lowMarginCount > 0 && lowMarginCount !== lossCount && (
              <p className="text-sm flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>{lowMarginCount}</strong> produto(s) com margem abaixo do ideal (20%).</span>
              </p>
            )}
            {avgMargin < 20 && avgMargin >= 0 && (
              <p className="text-sm flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Sua margem média está em <strong>{avgMargin.toFixed(1)}%</strong>, abaixo do recomendado (20%).</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
