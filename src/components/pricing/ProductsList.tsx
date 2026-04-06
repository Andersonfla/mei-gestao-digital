import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Eye, ArrowUpDown, X, SlidersHorizontal, PackageOpen, AlertCircle } from "lucide-react";
import type { PricingProduct, PricingProductFormData } from "@/types/pricing";
import { PricingLoadingSkeleton } from "./PricingLoadingSkeleton";
import { ProductFormDialog } from "./ProductFormDialog";
import { ProductDetailDialog } from "./ProductDetailDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { calcProductFull } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

interface ProductsListProps {
  products: PricingProduct[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (params: { id: string; isActive: boolean }) => Promise<void>;
  onCreate: (data: PricingProductFormData) => Promise<any>;
  onUpdate: (params: { id: string; data: Partial<PricingProductFormData> }) => Promise<any>;
  isCreating: boolean;
}

type SortField = "name" | "totalCost" | "sale_price" | "margin";
type SortDir = "asc" | "desc";

const categories = ["alimento", "bebida", "produto", "serviço", "combo", "digital", "consultoria", "outro"];

export function ProductsList({ products, isLoading, onDelete, onToggleActive, onCreate, onUpdate, isCreating }: ProductsListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<PricingProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<PricingProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (activeFilter === "active") list = list.filter((p) => p.is_active);
    else if (activeFilter === "inactive") list = list.filter((p) => !p.is_active);

    list.sort((a, b) => {
      const calcA = calcProductFull(a);
      const calcB = calcProductFull(b);
      let va: number | string, vb: number | string;
      switch (sortField) {
        case "name": va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case "totalCost": va = calcA.totalCost; vb = calcB.totalCost; break;
        case "sale_price": va = a.sale_price || 0; vb = b.sale_price || 0; break;
        case "margin": va = calcA.marginPercent; vb = calcB.marginPercent; break;
        default: va = a.name; vb = b.name;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, categoryFilter, activeFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const hasActiveFilters = search.trim() || categoryFilter !== "all" || activeFilter !== "all";
  const clearFilters = () => { setSearch(""); setCategoryFilter("all"); setActiveFilter("all"); };

  if (isLoading) return <PricingLoadingSkeleton count={6} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Seus Produtos & Serviços</h3>
          <p className="text-sm text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, descrição ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="icon" className="shrink-0 h-11 w-11" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border bg-muted/30">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ordenar por</label>
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="totalCost">Custo Total</SelectItem>
                  <SelectItem value="sale_price">Preço</SelectItem>
                  <SelectItem value="margin">Margem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Direção</label>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as SortDir)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="col-span-2 sm:col-span-4">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                  <X className="mr-1 h-3 w-3" /> Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty states */}
      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-semibold text-lg mb-1">Nenhum produto cadastrado</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">Adicione seu primeiro produto ou serviço para começar a precificar e acompanhar suas margens.</p>
            <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Cadastrar Primeiro Produto</Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h4 className="font-semibold mb-1">Nenhum resultado encontrado</h4>
            <p className="text-sm text-muted-foreground mb-4">Tente alterar os filtros ou termos de busca.</p>
            <Button variant="outline" onClick={clearFilters}><X className="mr-1 h-4 w-4" /> Limpar Filtros</Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {filtered.map((product) => {
            const calc = calcProductFull(product);
            return (
              <Card key={product.id} className={`transition-opacity ${!product.is_active ? "opacity-60" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{product.name}</CardTitle>
                      <CardDescription className="text-xs truncate">
                        {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : "Sem categoria"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={calc.status.variant} className="text-[10px] px-1.5">{calc.status.label}</Badge>
                      <Switch checked={product.is_active} onCheckedChange={(checked) => onToggleActive({ id: product.id, isActive: checked })} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Custo</span>
                      <span className="font-medium text-xs">{formatCurrency(calc.totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Preço</span>
                      <span className="font-bold text-xs">{formatCurrency(product.sale_price || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Lucro</span>
                      <span className={`font-medium text-xs ${calc.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>{formatCurrency(calc.profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Margem</span>
                      <span className={`font-medium text-xs ${calc.status.color}`}>{calc.marginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground text-xs">Markup</span>
                      <span className="font-medium text-xs">{calc.markupPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setDetailProduct(product)}>
                      <Eye className="h-3 w-3 mr-1" /> Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setEditProduct(product); setFormOpen(true); }}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive text-xs h-8 px-2" onClick={() => setDeleteId(product.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1">Nome <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("totalCost")}>
                    <span className="flex items-center gap-1 justify-end">Custo Total <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("sale_price")}>
                    <span className="flex items-center gap-1 justify-end">Preço <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="text-right">Lucro Unit.</TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("margin")}>
                    <span className="flex items-center gap-1 justify-end">Margem <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="text-right">Markup</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const calc = calcProductFull(product);
                  return (
                    <TableRow key={product.id} className={!product.is_active ? "opacity-50" : ""}>
                      <TableCell className="font-medium max-w-[180px] truncate">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">{product.category || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(calc.totalCost)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(product.sale_price || 0)}</TableCell>
                      <TableCell className={`text-right tabular-nums font-medium ${calc.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {formatCurrency(calc.profit)}
                      </TableCell>
                      <TableCell className={`text-right tabular-nums font-medium ${calc.status.color}`}>
                        {calc.marginPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{calc.markupPercent.toFixed(1)}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={calc.status.variant} className="text-[10px] px-1.5">{calc.status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={product.is_active} onCheckedChange={(checked) => onToggleActive({ id: product.id, isActive: checked })} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailProduct(product)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(product); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onCreate={onCreate} onUpdate={onUpdate} isCreating={isCreating} />
      <ProductDetailDialog product={detailProduct} onClose={() => setDetailProduct(null)} />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteId) onDelete(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
