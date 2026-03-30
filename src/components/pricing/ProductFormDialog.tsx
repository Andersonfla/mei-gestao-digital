import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PricingProduct, PricingProductFormData } from "@/types/pricing";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PricingProduct | null;
  onCreate: (data: PricingProductFormData) => Promise<any>;
  onUpdate: (params: { id: string; data: Partial<PricingProductFormData> }) => Promise<any>;
  isCreating: boolean;
}

const categories = ["alimento", "bebida", "produto", "serviço", "combo", "digital", "consultoria", "outro"];

const defaultValues: PricingProductFormData = {
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
};

export function ProductFormDialog({ open, onOpenChange, product, onCreate, onUpdate, isCreating }: ProductFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PricingProductFormData>({ defaultValues });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category || "produto",
        description: product.description || "",
        ingredient_cost: product.ingredient_cost,
        packaging_cost: product.packaging_cost,
        operational_cost: product.operational_cost,
        platform_fee: product.platform_fee,
        delivery_cost: product.delivery_cost,
        other_costs: product.other_costs,
        sale_price: product.sale_price,
        average_units_sold: product.average_units_sold,
        sales_share_percent: product.sales_share_percent,
        is_active: product.is_active,
      });
    } else {
      reset(defaultValues);
    }
  }, [product, reset]);

  const onSubmit = async (data: PricingProductFormData) => {
    if (product) {
      await onUpdate({ id: product.id, data });
    } else {
      await onCreate(data);
    }
    onOpenChange(false);
  };

  const costFields = [
    { id: "ingredient_cost", label: "Custo de Ingredientes (R$)" },
    { id: "packaging_cost", label: "Embalagem (R$)" },
    { id: "operational_cost", label: "Custo Operacional (R$)" },
    { id: "platform_fee", label: "Taxa da Plataforma (R$)" },
    { id: "delivery_cost", label: "Entrega (R$)" },
    { id: "other_costs", label: "Outros Custos (R$)" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Ex: Bolo de chocolate" />
            {errors.name && <p className="text-xs text-destructive">Nome é obrigatório</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register("description")} placeholder="Descrição opcional" />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Custos</p>
            <div className="grid grid-cols-2 gap-3">
              {costFields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                  <Input id={f.id} type="number" step="0.01" {...register(f.id, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
              <Input id="sale_price" type="number" step="0.01" {...register("sale_price", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="average_units_sold">Qtd. Vendida/Mês</Label>
              <Input id="average_units_sold" type="number" step="0.01" {...register("average_units_sold", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales_share_percent">Participação nas Vendas (%)</Label>
            <Input id="sales_share_percent" type="number" step="0.01" {...register("sales_share_percent", { valueAsNumber: true })} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? "Salvando..." : product ? "Salvar" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
