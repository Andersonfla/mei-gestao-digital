import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package } from "lucide-react";
import type { Product } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { PricingEmptyState } from "./PricingEmptyState";

interface PricingReportsProps {
  products: Product[];
  isLoading: boolean;
}

export function PricingReports({ products, isLoading }: PricingReportsProps) {
  if (isLoading) return <PricingLoadingSkeleton count={3} />;

  if (products.length === 0) {
    return (
      <PricingEmptyState
        icon={<BarChart3 className="h-8 w-8 text-primary" />}
        title="Sem dados para relatórios"
        description="Cadastre seus produtos para visualizar relatórios de precificação e margens."
      />
    );
  }

  const activeProducts = products.filter((p) => p.is_active);
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Top margin products
  const productsByMargin = [...activeProducts]
    .map((p) => {
      const totalCost = p.cost_price + p.fixed_costs + p.variable_costs + p.labor_cost;
      const margin = totalCost > 0 ? ((p.selling_price - totalCost) / totalCost) * 100 : 0;
      return { ...p, margin, totalCost };
    })
    .sort((a, b) => b.margin - a.margin);

  // Revenue by category
  const byCategory = activeProducts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.selling_price * p.monthly_quantity;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Ranking por Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productsByMargin.slice(0, 10).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}º</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(p.selling_price)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${p.margin >= 20 ? "text-emerald-600" : "text-amber-600"}`}>
                    {p.margin.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Receita por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, revenue]) => {
                  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
                  const pct = total > 0 ? (revenue / total) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="text-muted-foreground">{formatCurrency(revenue)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
