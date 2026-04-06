import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { History, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { PricingProduct, PricingProductHistory } from "@/types/pricing";
import { calcProductFull } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";
import { pricingProductService } from "@/services/pricingProductService";

interface ProductDetailDialogProps {
  product: PricingProduct | null;
  onClose: () => void;
}

export function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  const [history, setHistory] = useState<PricingProductHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setHistoryLoading(true);
      pricingProductService
        .getProductHistory(product.id)
        .then(setHistory)
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    } else {
      setHistory([]);
    }
  }, [product]);

  if (!product) return null;

  const calc = calcProductFull(product);

  const costItems = [
    { label: "Ingredientes", value: product.ingredient_cost || 0 },
    { label: "Embalagem", value: product.packaging_cost || 0 },
    { label: "Operacional", value: product.operational_cost || 0 },
    { label: "Taxa Plataforma", value: product.platform_fee || 0 },
    { label: "Entrega", value: product.delivery_cost || 0 },
    { label: "Outros", value: product.other_costs || 0 },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {product.name}
            <Badge variant={product.is_active ? "default" : "secondary"} className="text-[10px]">
              {product.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant={calc.status.variant} className="text-[10px]">
              {calc.status.label}
            </Badge>
          </DialogTitle>
          {product.category && (
            <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
          )}
        </DialogHeader>

        {product.description && (
          <p className="text-sm text-muted-foreground italic">{product.description}</p>
        )}

        <Separator />

        {/* Detalhamento de Custos */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Detalhamento de Custos</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {costItems.map((item) => (
              <div key={item.label} className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="tabular-nums font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
            <span>Custo Total</span>
            <span className="tabular-nums">{formatCurrency(calc.totalCost)}</span>
          </div>
        </div>

        <Separator />

        {/* Indicadores Principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Preço de Venda</p>
            <p className="text-lg font-bold">{formatCurrency(product.sale_price || 0)}</p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Lucro Unitário</p>
            <p className={`text-lg font-bold ${calc.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {formatCurrency(calc.profit)}
            </p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className={`text-lg font-bold ${calc.status.color}`}>
              {calc.marginPercent.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Markup</p>
            <p className="text-lg font-bold">{calc.markupPercent.toFixed(1)}%</p>
          </div>
        </div>

        <Separator />

        {/* Preços de Referência */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Preços de Referência</p>
          <div className="rounded-xl border p-3 text-center bg-amber-500/5">
            <p className="text-xs text-muted-foreground">Preço Mínimo (sem prejuízo)</p>
            <p className="text-base font-bold text-amber-600">{formatCurrency(calc.minPrice)}</p>
          </div>
          {calc.totalCost > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {calc.suggestedPrices.map((sp) => {
                const isCurrentAbove = (product.sale_price || 0) >= sp.price;
                return (
                  <div key={sp.label} className={`rounded-lg border p-2.5 text-center ${isCurrentAbove ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30"}`}>
                    <p className="text-xs text-muted-foreground">Margem {sp.label}</p>
                    <p className="text-sm font-bold">{formatCurrency(sp.price)}</p>
                    {isCurrentAbove && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Atingido</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vendas */}
        {(product.average_units_sold > 0 || product.sales_share_percent > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Desempenho de Vendas</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qtd. Vendida/Mês</span>
                  <span className="font-medium">{product.average_units_sold}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participação nas Vendas</span>
                  <span className="font-medium">{product.sales_share_percent}%</span>
                </div>
              </div>
              {product.average_units_sold > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Receita Mensal</p>
                    <p className="text-base font-bold">
                      {formatCurrency((product.sale_price || 0) * product.average_units_sold)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Lucro Mensal</p>
                    <p className={`text-base font-bold ${calc.monthlyProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {formatCurrency(calc.monthlyProfit)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Histórico de Alterações */}
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <History className="h-4 w-4 text-muted-foreground" />
            Histórico de Alterações
          </p>

          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Nenhuma alteração registrada ainda.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 20).map((h) => {
                const isPriceChange = h.change_type === "price_change";
                const Icon = isPriceChange
                  ? (h.new_sale_price || 0) > (h.old_sale_price || 0) ? TrendingUp : TrendingDown
                  : (h.new_total_cost || 0) > (h.old_total_cost || 0) ? TrendingUp : TrendingDown;
                const isIncrease = isPriceChange
                  ? (h.new_sale_price || 0) > (h.old_sale_price || 0)
                  : (h.new_total_cost || 0) > (h.old_total_cost || 0);

                return (
                  <div key={h.id} className="rounded-lg border p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {isPriceChange ? "Preço" : "Custo"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(h.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isIncrease ? "text-amber-600" : "text-emerald-600"}`} />
                      {isPriceChange ? (
                        <span className="flex items-center gap-1 text-xs">
                          {formatCurrency(h.old_sale_price || 0)}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{formatCurrency(h.new_sale_price || 0)}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs">
                          {formatCurrency(h.old_total_cost || 0)}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{formatCurrency(h.new_total_cost || 0)}</span>
                        </span>
                      )}
                    </div>
                    {h.notes && <p className="text-[10px] text-muted-foreground">{h.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
