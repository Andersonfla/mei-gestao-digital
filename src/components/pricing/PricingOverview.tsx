import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import type { PricingProduct } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { PricingEmptyState } from "./PricingEmptyState";

interface PricingOverviewProps {
  products: PricingProduct[];
  isLoading: boolean;
}

function totalCost(p: PricingProduct) {
  return (p.ingredient_cost || 0) + (p.packaging_cost || 0) + (p.operational_cost || 0) +
    (p.platform_fee || 0) + (p.delivery_cost || 0) + (p.other_costs || 0);
}

export function PricingOverview({ products, isLoading }: PricingOverviewProps) {
  if (isLoading) return <PricingLoadingSkeleton count={4} />;

  const activeProducts = products.filter((p) => p.is_active);
  const totalRevenue = activeProducts.reduce((sum, p) => sum + (p.sale_price || 0) * (p.average_units_sold || 0), 0);
  const totalCosts = activeProducts.reduce((sum, p) => sum + totalCost(p) * (p.average_units_sold || 0), 0);
  const avgMargin =
    activeProducts.length > 0
      ? activeProducts.reduce((sum, p) => {
          const cost = totalCost(p);
          return sum + (cost > 0 ? ((p.sale_price - cost) / cost) * 100 : 0);
        }, 0) / activeProducts.length
      : 0;

  const cards = [
    { title: "Produtos Ativos", value: activeProducts.length.toString(), subtitle: `de ${products.length} total`, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { title: "Receita Estimada/Mês", value: totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), subtitle: "baseado na qtd. vendida", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Custo Total/Mês", value: totalCosts.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), subtitle: "soma de todos os custos", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
    { title: "Margem Média", value: `${avgMargin.toFixed(1)}%`, subtitle: "sobre custo total", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-500/10" },
  ];

  if (products.length === 0) {
    return <PricingEmptyState title="Nenhum produto cadastrado" description="Cadastre seus produtos ou serviços para começar a precificar e acompanhar suas margens de lucro." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
