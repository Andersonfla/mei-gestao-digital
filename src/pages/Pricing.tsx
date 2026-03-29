import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Package, Calculator, Receipt, BarChart3 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { PricingOverview } from "@/components/pricing/PricingOverview";
import { ProductsList } from "@/components/pricing/ProductsList";
import { PriceSimulator } from "@/components/pricing/PriceSimulator";
import { TicketSimulator } from "@/components/pricing/TicketSimulator";
import { PricingReports } from "@/components/pricing/PricingReports";

export default function Pricing() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct, toggleActive, isCreating } = useProducts();

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Precificação</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie preços, simule margens e acompanhe seus produtos</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex overflow-x-auto no-scrollbar h-auto p-1 gap-1">
          <TabsTrigger value="overview" className="flex-1 min-w-0 text-xs sm:text-sm gap-1.5 py-2">
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex-1 min-w-0 text-xs sm:text-sm gap-1.5 py-2">
            <Package className="h-4 w-4 shrink-0" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="price-sim" className="flex-1 min-w-0 text-xs sm:text-sm gap-1.5 py-2">
            <Calculator className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Simulador Preço</span>
            <span className="sm:hidden">Preço</span>
          </TabsTrigger>
          <TabsTrigger value="ticket-sim" className="flex-1 min-w-0 text-xs sm:text-sm gap-1.5 py-2">
            <Receipt className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Ticket Médio</span>
            <span className="sm:hidden">Ticket</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 min-w-0 text-xs sm:text-sm gap-1.5 py-2">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Relatórios</span>
            <span className="sm:hidden">Relat.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PricingOverview products={products} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductsList
            products={products}
            isLoading={isLoading}
            onDelete={deleteProduct}
            onToggleActive={toggleActive}
            onCreate={createProduct}
            onUpdate={updateProduct}
            isCreating={isCreating}
          />
        </TabsContent>
        <TabsContent value="price-sim" className="mt-6">
          <PriceSimulator />
        </TabsContent>
        <TabsContent value="ticket-sim" className="mt-6">
          <TicketSimulator />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <PricingReports products={products} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
