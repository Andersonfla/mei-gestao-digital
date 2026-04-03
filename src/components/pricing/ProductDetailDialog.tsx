import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PricingProduct } from "@/types/pricing";

interface ProductDetailDialogProps {
  product: PricingProduct | null;
  onClose: () => void;
}

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  if (!product) return null;

  const cost =
    (product.ingredient_cost || 0) +
    (product.packaging_cost || 0) +
    (product.operational_cost || 0) +
    (product.platform_fee || 0) +
    (product.delivery_cost || 0) +
    (product.other_costs || 0);

  const price = product.sale_price || 0;
  const profit = price - cost;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;

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
            <span className="tabular-nums">{formatCurrency(cost)}</span>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Preço de Venda</p>
            <p className="text-lg font-bold">{formatCurrency(price)}</p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Lucro Unitário</p>
            <p className={`text-lg font-bold ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {formatCurrency(profit)}
            </p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className={`text-lg font-bold ${margin >= 30 ? "text-emerald-600" : margin >= 10 ? "text-amber-600" : "text-destructive"}`}>
              {margin.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Markup</p>
            <p className="text-lg font-bold">{markup.toFixed(1)}%</p>
          </div>
        </div>

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
                  <span className={profit >= 0 ? "text-emerald-600" : "text-destructive"}>
                    {formatCurrency(profit * product.average_units_sold)}
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
