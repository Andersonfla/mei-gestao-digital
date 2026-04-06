import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PricingProduct } from "@/types/pricing";
import { calcProductFull } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

interface ProductDetailDialogProps {
  product: PricingProduct | null;
  onClose: () => void;
}

export function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
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

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            <Badge variant={product.is_active ? "default" : "secondary"} className="text-[10px]">
              {product.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </DialogTitle>
          {product.category && (
            <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
          )}
        </DialogHeader>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <Separator />

        {/* Custos */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Detalhamento de Custos</p>
          {costItems.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="tabular-nums">{formatCurrency(item.value)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm font-semibold">
            <span>Custo Total</span>
            <span className="tabular-nums">{formatCurrency(calc.totalCost)}</span>
          </div>
        </div>

        <Separator />

        {/* Indicadores */}
        <div className="grid grid-cols-2 gap-4">
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

        {/* Status */}
        <div className="flex items-center justify-between rounded-xl border p-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={calc.status.variant}>{calc.status.label}</Badge>
        </div>

        {/* Preços sugeridos */}
        {calc.totalCost > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Preços Sugeridos por Margem</p>
              <div className="grid grid-cols-2 gap-2">
                {calc.suggestedPrices.map((sp) => (
                  <div key={sp.label} className="rounded-lg border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Margem {sp.label}</p>
                    <p className="text-sm font-bold">{formatCurrency(sp.price)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border p-2 text-center">
                <p className="text-xs text-muted-foreground">Preço Mínimo (sem prejuízo)</p>
                <p className="text-sm font-bold text-amber-600">{formatCurrency(calc.minPrice)}</p>
              </div>
            </div>
          </>
        )}

        {/* Vendas */}
        {(product.average_units_sold > 0 || product.sales_share_percent > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Vendas</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qtd. Vendida/Mês</span>
                <span>{product.average_units_sold}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Participação nas Vendas</span>
                <span>{product.sales_share_percent}%</span>
              </div>
              {product.average_units_sold > 0 && (
                <div className="flex justify-between text-sm font-semibold">
                  <span>Lucro Mensal Estimado</span>
                  <span className={calc.profit >= 0 ? "text-emerald-600" : "text-destructive"}>
                    {formatCurrency(calc.monthlyProfit)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
