import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { PricingProduct, PricingProductFormData } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { PricingEmptyState } from "./PricingEmptyState";
import { ProductFormDialog } from "./ProductFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductsListProps {
  products: PricingProduct[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (params: { id: string; isActive: boolean }) => Promise<void>;
  onCreate: (data: PricingProductFormData) => Promise<any>;
  onUpdate: (params: { id: string; data: Partial<PricingProductFormData> }) => Promise<any>;
  isCreating: boolean;
}

function totalCost(p: PricingProduct) {
  return (p.ingredient_cost || 0) + (p.packaging_cost || 0) + (p.operational_cost || 0) +
    (p.platform_fee || 0) + (p.delivery_cost || 0) + (p.other_costs || 0);
}

export function ProductsList({ products, isLoading, onDelete, onToggleActive, onCreate, onUpdate, isCreating }: ProductsListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<PricingProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <PricingLoadingSkeleton count={6} />;

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Seus Produtos & Serviços</h3>
          <p className="text-sm text-muted-foreground">Gerencie e precifique seus itens</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <PricingEmptyState title="Nenhum produto cadastrado" description="Adicione seu primeiro produto ou serviço para começar a precificar." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const cost = totalCost(product);
            const margin = cost > 0 ? ((product.sale_price - cost) / cost) * 100 : 0;

            return (
              <Card key={product.id} className={!product.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{product.name}</CardTitle>
                      <CardDescription className="truncate">{product.category || "Sem categoria"}</CardDescription>
                    </div>
                    <Switch checked={product.is_active} onCheckedChange={(checked) => onToggleActive({ id: product.id, isActive: checked })} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Preço de venda</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(product.sale_price)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Custo total</span>
                    <span className="text-sm font-medium">{formatCurrency(cost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Margem</span>
                    <Badge variant={margin >= 20 ? "default" : "destructive"} className="text-xs">{margin.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditProduct(product); setFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onCreate={onCreate} onUpdate={onUpdate} isCreating={isCreating} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { if (deleteId) { await onDelete(deleteId); setDeleteId(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
