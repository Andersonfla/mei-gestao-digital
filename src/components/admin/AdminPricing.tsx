import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, Users, AlertTriangle, FlaskConical, Package, Search } from "lucide-react";
import { adminPricingService, type AdminPricingProductRow, type AdminPricingStats } from "@/services/adminPricingService";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

export function AdminPricing() {
  const [stats, setStats] = useState<AdminPricingStats | null>(null);
  const [products, setProducts] = useState<AdminPricingProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [view, setView] = useState<"all" | "loss">("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, p] = await Promise.all([
          adminPricingService.getStats(),
          adminPricingService.getAllProducts(),
        ]);
        setStats(s);
        setProducts(p);
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar dados de Precificação");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const userOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (!map.has(p.user_id)) map.set(p.user_id, p.user_email || p.user_id.slice(0, 8));
    });
    return Array.from(map.entries());
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (view === "loss" && !(p.margin_percent < 0 && (p.sale_price || 0) > 0)) return false;
      if (userFilter !== "all" && p.user_id !== userFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.user_email || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, search, userFilter, view]);

  const cards = stats
    ? [
        { title: "Produtos Cadastrados", value: stats.totalProducts.toString(), subtitle: `${stats.activeProducts} ativos`, icon: Package, color: "text-primary" },
        { title: "Usuários do Módulo", value: stats.uniqueUsers.toString(), subtitle: "com produtos cadastrados", icon: Users, color: "text-violet-600" },
        { title: "Produtos com Prejuízo", value: stats.negativeMarginCount.toString(), subtitle: "margem negativa", icon: AlertTriangle, color: "text-destructive" },
        { title: "Simulações Realizadas", value: stats.totalSimulations.toString(), subtitle: "total no sistema", icon: FlaskConical, color: "text-emerald-600" },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><div className="h-4 w-24 animate-pulse bg-muted rounded" /></CardHeader>
            <CardContent><div className="h-8 w-16 animate-pulse bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
          <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Módulo Precificação
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">Visão administrativa do uso do módulo</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Produtos por Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {userOptions.map(([id, email]) => (
                  <SelectItem key={id} value={id}>{email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "all" | "loss")}>
            <TabsList>
              <TabsTrigger value="all">Todos ({products.length})</TabsTrigger>
              <TabsTrigger value="loss">
                Em Prejuízo ({stats?.negativeMarginCount || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={view} className="mt-4">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum produto encontrado</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filtered.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          {!p.is_active && <Badge variant="secondary" className="text-[10px]">inativo</Badge>}
                          {p.margin_percent < 0 && (p.sale_price || 0) > 0 && (
                            <Badge variant="destructive" className="text-[10px]">prejuízo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.user_email || p.user_id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs sm:text-sm shrink-0">
                        <div>
                          <p className="text-muted-foreground">Preço</p>
                          <p className="font-semibold">{formatCurrency(p.sale_price || 0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Custo</p>
                          <p className="font-semibold">{formatCurrency(p.total_cost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Margem</p>
                          <p className={`font-bold ${p.margin_percent < 0 ? "text-destructive" : p.margin_percent < 20 ? "text-amber-600" : "text-emerald-600"}`}>
                            {p.margin_percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
