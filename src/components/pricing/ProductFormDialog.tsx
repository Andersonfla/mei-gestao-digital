import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { PricingProduct, PricingProductFormData } from "@/types/pricing";
import { calcTotalCost, calcProfit, calcMarginPercent, calcProductStatus, calcAllSuggestedPrices } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PricingProduct | null;
  onCreate: (data: PricingProductFormData) => Promise<any>;
  onUpdate: (params: { id: string; data: Partial<PricingProductFormData> }) => Promise<any>;
  isCreating: boolean;
}

const categories = ["alimento", "bebida", "produto", "serviço", "combo", "digital", "consultoria", "outro"];

const nonNegative = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
  z.number().min(0, "Não pode ser negativo")
);

const productSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(200, "Máximo 200 caracteres"),
  category: z.string().default("produto"),
  description: z.preprocess((v) => (v === "" ? null : v), z.string().max(500).nullable().optional()).default(null),
  ingredient_cost: nonNegative,
  packaging_cost: nonNegative,
  operational_cost: nonNegative,
  platform_fee: nonNegative,
  delivery_cost: nonNegative,
  other_costs: nonNegative,
  sale_price: nonNegative,
  average_units_sold: nonNegative,
  sales_share_percent: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().min(0, "Mínimo 0%").max(100, "Máximo 100%")
  ),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof productSchema>;

export function ProductFormDialog({ open, onOpenChange, product, onCreate, onUpdate, isCreating }: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "produto",
      description: "",
      ingredient_cost: 0,
      packaging_cost: 0,
      operational_cost: 0,
      platform_fee: 0,
      delivery_cost: 0,
      other_costs: 0,
      sale_price: 0,
      average_units_sold: 0,
      sales_share_percent: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category || "produto",
        description: product.description || "",
        ingredient_cost: product.ingredient_cost ?? 0,
        packaging_cost: product.packaging_cost ?? 0,
        operational_cost: product.operational_cost ?? 0,
        platform_fee: product.platform_fee ?? 0,
        delivery_cost: product.delivery_cost ?? 0,
        other_costs: product.other_costs ?? 0,
        sale_price: product.sale_price ?? 0,
        average_units_sold: product.average_units_sold ?? 0,
        sales_share_percent: product.sales_share_percent ?? 0,
        is_active: product.is_active ?? true,
      });
    } else {
      reset({
        name: "",
        category: "produto",
        description: "",
        ingredient_cost: 0,
        packaging_cost: 0,
        operational_cost: 0,
        platform_fee: 0,
        delivery_cost: 0,
        other_costs: 0,
        sale_price: 0,
        average_units_sold: 0,
        sales_share_percent: 0,
        is_active: true,
      });
    }
  }, [product, open, reset]);

  const watchedValues = watch();
  const totalCost = calcTotalCost(watchedValues as any);
  const profit = calcProfit(watchedValues.sale_price || 0, totalCost);
  const margin = calcMarginPercent(watchedValues.sale_price || 0, totalCost);
  const status = calcProductStatus(margin);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      description: data.description || null,
    } as PricingProductFormData;

    if (product) {
      await onUpdate({ id: product.id, data: payload });
    } else {
      await onCreate(payload);
    }
    onOpenChange(false);
  };

  const costFields = [
    { id: "ingredient_cost" as const, label: "Ingredientes (R$)" },
    { id: "packaging_cost" as const, label: "Embalagem (R$)" },
    { id: "operational_cost" as const, label: "Operacional (R$)" },
    { id: "platform_fee" as const, label: "Taxa Plataforma (R$)" },
    { id: "delivery_cost" as const, label: "Entrega (R$)" },
    { id: "other_costs" as const, label: "Outros (R$)" },
  ];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Bolo de chocolate" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição curta</Label>
            <Input id="description" {...register("description")} placeholder="Descrição opcional do produto" />
          </div>

          {/* Categoria + Ativo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={watch("category") || "produto"} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex items-center gap-2 h-11 px-3 rounded-xl border-2 border-input bg-background">
                <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
                <span className="text-sm text-muted-foreground">{watch("is_active") ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>

          {/* Custos */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Custos do Produto</p>
            <div className="grid grid-cols-2 gap-3">
              {costFields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                  <Input id={f.id} type="number" step="0.01" min="0" placeholder="0,00" {...register(f.id)} />
                  {errors[f.id] && <p className="text-xs text-destructive">{errors[f.id]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Preço e Vendas */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Preço e Vendas</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sale_price" className="text-xs">Preço de Venda (R$)</Label>
                <Input id="sale_price" type="number" step="0.01" min="0" placeholder="0,00" {...register("sale_price")} />
                {errors.sale_price && <p className="text-xs text-destructive">{errors.sale_price.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="average_units_sold" className="text-xs">Qtd. Vendida/Mês</Label>
                <Input id="average_units_sold" type="number" step="0.01" min="0" placeholder="0" {...register("average_units_sold")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sales_share_percent" className="text-xs">Participação nas Vendas (%)</Label>
              <Input id="sales_share_percent" type="number" step="0.01" min="0" max="100" placeholder="0" {...register("sales_share_percent")} />
              {errors.sales_share_percent && <p className="text-xs text-destructive">{errors.sales_share_percent.message}</p>}
            </div>
          </div>

          {/* Resumo em tempo real */}
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Resumo</p>
              <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Custo Total</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(totalCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lucro Unit.</p>
                <p className={`text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {formatCurrency(profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margem</p>
                <p className={`text-sm font-bold ${status.color}`}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>
            {totalCost > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-primary/10">
                <p className="text-[10px] font-medium text-muted-foreground">Preços sugeridos por margem:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {calcAllSuggestedPrices(totalCost).map((sp) => (
                    <div key={sp.label} className="rounded-lg bg-background border p-1.5 text-center">
                      <p className="text-[9px] text-muted-foreground">{sp.label}</p>
                      <p className="text-[11px] font-bold">{formatCurrency(sp.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : product ? (
                "Salvar Alterações"
              ) : (
                "Criar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
