import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, ProductFormData } from "@/types/pricing";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onCreate: (data: ProductFormData) => Promise<any>;
  onUpdate: (params: { id: string; data: Partial<ProductFormData> }) => Promise<any>;
  isCreating: boolean;
}

const categories = ["produto", "serviço", "combo", "digital", "consultoria"];
const units = ["unidade", "hora", "kg", "litro", "metro", "pacote", "sessão"];

export function ProductFormDialog({ open, onOpenChange, product, onCreate, onUpdate, isCreating }: ProductFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      category: "produto",
      unit: "unidade",
      cost_price: 0,
      selling_price: 0,
      fixed_costs: 0,
      variable_costs: 0,
      labor_cost: 0,
      desired_margin: 30,
      monthly_quantity: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        category: product.category,
        unit: product.unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        fixed_costs: product.fixed_costs,
        variable_costs: product.variable_costs,
        labor_cost: product.labor_cost,
        desired_margin: product.desired_margin,
        monthly_quantity: product.monthly_quantity,
        is_active: product.is_active,
      });
    } else {
      reset({
        name: "",
        description: "",
        category: "produto",
        unit: "unidade",
        cost_price: 0,
        selling_price: 0,
        fixed_costs: 0,
        variable_costs: 0,
        labor_cost: 0,
        desired_margin: 30,
        monthly_quantity: 0,
        is_active: true,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    if (product) {
      await onUpdate({ id: product.id, data });
    } else {
      await onCreate(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Ex: Consultoria financeira" />
            {errors.name && <p className="text-xs text-destructive">Nome é obrigatório</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register("description")} placeholder="Descrição opcional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={watch("unit")} onValueChange={(v) => setValue("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Custo do Produto (R$)</Label>
              <Input id="cost_price" type="number" step="0.01" {...register("cost_price", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Preço de Venda (R$)</Label>
              <Input id="selling_price" type="number" step="0.01" {...register("selling_price", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fixed_costs">Custos Fixos (R$)</Label>
              <Input id="fixed_costs" type="number" step="0.01" {...register("fixed_costs", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variable_costs">Custos Variáveis (R$)</Label>
              <Input id="variable_costs" type="number" step="0.01" {...register("variable_costs", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="labor_cost">Mão de Obra (R$)</Label>
              <Input id="labor_cost" type="number" step="0.01" {...register("labor_cost", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_margin">Margem Desejada (%)</Label>
              <Input id="desired_margin" type="number" step="0.1" {...register("desired_margin", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_quantity">Quantidade Mensal</Label>
            <Input id="monthly_quantity" type="number" {...register("monthly_quantity", { valueAsNumber: true })} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? "Salvando..." : product ? "Salvar" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
