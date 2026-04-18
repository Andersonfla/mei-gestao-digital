import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Trophy, DollarSign, Target, Info } from "lucide-react";
import type { PricingProduct } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { PricingEmptyState } from "./PricingEmptyState";
import { calcTotalCost, calcMarginPercent, calcProfit, calcSuggestedPrice } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

interface PricingReportsProps {
  products: PricingProduct[];
  isLoading: boolean;
}

interface EnrichedProduct extends PricingProduct {
  totalCostVal: number;
  margin: number;
  profit: number;
  suggestedPrice20: number;
}

function getStatusMessage(p: EnrichedProduct): { message: string; type: "success" | "warning" | "danger" | "info" } {
  if (p.margin < 0) {
    return { type: "danger", message: "Seu produto está operando no prejuízo." };
  }
  if (p.margin < 10) {
    return { type: "danger", message: `Sua margem está muito baixa. Preço sugerido para 20% de margem: ${formatCurrency(p.suggestedPrice20)}.` };
  }
  if (p.margin < 20) {
    return { type: "warning", message: `Sua margem está abaixo do ideal. Preço sugerido para 20%: ${formatCurrency(p.suggestedPrice20)}.` };
  }
  if ((p.sales_share_percent || 0) >= 30 && p.margin < 25) {
    return { type: "warning", message: "Esse produto pode estar puxando o resultado financeiro para baixo (alta participação, margem baixa)." };
  }
  if ((p.sales_share_percent || 0) >= 30) {
    return { type: "info", message: "Esse item merece atenção porque tem alta participação nas vendas." };
  }
  return { type: "success", message: "Esse produto já tem uma margem saudável." };
}

function ProductRow({ p, metric, label }: { p: EnrichedProduct; metric: string; label?: string }) {
  const status = getStatusMessage(p);
  const colors = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-destructive",
    info: "text-primary",
  };
  return (
    <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            Preço: {formatCurrency(p.sale_price)} · Custo: {formatCurrency(p.totalCostVal)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${colors[status.type]}`}>{metric}</p>
          {label && <p className="text-xs text-muted-foreground">{label}</p>}
        </div>
      </div>
      <p className={`text-xs ${colors[status.type]} flex items-start gap-1.5`}>
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <span>{status.message}</span>
      </p>
    </div>
  );
}

export function PricingReports({ products, isLoading }: PricingReportsProps) {
  const [tab, setTab] = useState("rankings");

  const enriched = useMemo<EnrichedProduct[]>(() => {
    return products
      .filter((p) => p.is_active)
      .map((p) => {
        const cost = calcTotalCost(p);
        const margin = calcMarginPercent(p.sale_price || 0, cost);
        const profit = calcProfit(p.sale_price || 0, cost);
        return {
          ...p,
          totalCostVal: cost,
          margin,
          profit,
          suggestedPrice20: calcSuggestedPrice(cost, 0.2),
        };
      });
  }, [products]);

  if (isLoading) return <PricingLoadingSkeleton count={3} />;

  if (products.length === 0) {
    return <PricingEmptyState icon={<BarChart3 className="h-8 w-8 text-primary" />} title="Sem dados para relatórios" description="Cadastre seus produtos para visualizar relatórios de precificação e margens." />;
  }

  const lowMargin = enriched.filter((p) => p.margin < 20).sort((a, b) => a.margin - b.margin);
  const healthyMargin = enriched.filter((p) => p.margin >= 20).sort((a, b) => b.margin - a.margin);
  const lowProfit = [...enriched].filter((p) => (p.sale_price || 0) > 0).sort((a, b) => a.profit - b.profit).slice(0, 10);
  const belowSuggested = enriched.filter((p) => (p.sale_price || 0) < p.suggestedPrice20 && p.totalCostVal > 0);
  const withPrice = enriched.filter((p) => (p.sale_price || 0) > 0);
  const byMargin = [...withPrice].sort((a, b) => b.margin - a.margin);
  const byProfit = [...withPrice].sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6">
      {/* Resumo de alertas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Margem baixa</p>
            <p className="text-2xl font-bold text-destructive">{lowMargin.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saudáveis</p>
            <p className="text-2xl font-bold text-emerald-600">{healthyMargin.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Abaixo do sugerido</p>
            <p className="text-2xl font-bold text-amber-600">{belowSuggested.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total ativos</p>
            <p className="text-2xl font-bold">{enriched.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex overflow-x-auto h-auto p-1">
          <TabsTrigger value="rankings" className="flex-1 text-xs sm:text-sm">Rankings</TabsTrigger>
          <TabsTrigger value="low-margin" className="flex-1 text-xs sm:text-sm">Margem Baixa</TabsTrigger>
          <TabsTrigger value="healthy" className="flex-1 text-xs sm:text-sm">Saudáveis</TabsTrigger>
          <TabsTrigger value="below" className="flex-1 text-xs sm:text-sm">Abaixo do Sugerido</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-amber-500" /> Ranking por Margem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byMargin.slice(0, 10).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="shrink-0">{i + 1}º</Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(p.sale_price)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${p.margin >= 20 ? "text-emerald-600" : p.margin >= 0 ? "text-amber-600" : "text-destructive"}`}>
                      {p.margin.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" /> Ranking por Lucro Unitário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byProfit.slice(0, 10).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="shrink-0">{i + 1}º</Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Margem {p.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${p.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {formatCurrency(p.profit)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="low-margin" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Produtos com Margem Baixa (&lt; 20%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowMargin.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">🎉 Nenhum produto com margem baixa!</p>
              ) : (
                lowMargin.map((p) => <ProductRow key={p.id} p={p} metric={`${p.margin.toFixed(1)}%`} label="margem" />)
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" /> Lucro Unitário Mais Baixo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowProfit.map((p) => <ProductRow key={p.id} p={p} metric={formatCurrency(p.profit)} label="lucro/un" />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healthy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" /> Produtos Saudáveis (≥ 20%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {healthyMargin.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Nenhum produto com margem saudável ainda. Use o simulador para ajustar preços.</p>
              ) : (
                healthyMargin.map((p) => <ProductRow key={p.id} p={p} metric={`${p.margin.toFixed(1)}%`} label="margem" />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="below" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-amber-600" /> Produtos Abaixo do Preço Sugerido (20%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {belowSuggested.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">🎉 Todos os produtos estão acima do preço sugerido!</p>
              ) : (
                belowSuggested.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg bg-muted/30 border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Atual: {formatCurrency(p.sale_price)} · Sugerido: <span className="text-emerald-600 font-medium">{formatCurrency(p.suggestedPrice20)}</span>
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-600 shrink-0">
                        +{formatCurrency(p.suggestedPrice20 - (p.sale_price || 0))}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 flex items-start gap-1.5">
                      <Info className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>O preço sugerido para margem de 20% é {formatCurrency(p.suggestedPrice20)}.</span>
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
