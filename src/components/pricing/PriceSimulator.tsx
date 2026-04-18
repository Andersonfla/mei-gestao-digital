import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Save, ArrowRight, TrendingUp, TrendingDown, Package, PenLine } from "lucide-react";
import { usePricingProducts } from "@/hooks/usePricingProducts";
import { pricingSimulationService } from "@/services/pricingSimulationService";
import { calcTotalCost, calcProfit, calcMarginPercent, calcMarkupPercent, calcMinPrice, calcAllSuggestedPrices, calcProductStatus } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

type SimMode = "product" | "manual";

export function PriceSimulator() {
  const { products } = usePricingProducts();

  const [mode, setMode] = useState<SimMode>("product");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [simulatedPrice, setSimulatedPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [saving, setSaving] = useState(false);
  const [simulated, setSimulated] = useState(false);

  // When a product is selected, fill fields
  useEffect(() => {
    if (mode === "product" && selectedProductId) {
      const p = products.find((pr) => pr.id === selectedProductId);
      if (p) {
        const cost = calcTotalCost(p);
        setCurrentPrice(p.sale_price || 0);
        setTotalCost(cost);
        setSimulatedPrice(p.sale_price || 0);
        setSimulated(false);
      }
    }
  }, [selectedProductId, mode, products]);

  // Reset when switching mode
  useEffect(() => {
    setSelectedProductId("");
    setCurrentPrice(0);
    setSimulatedPrice(0);
    setTotalCost(0);
    setSimulated(false);
  }, [mode]);

  const handleSimulate = () => {
    setSimulated(true);
  };

  // Calculations
  const curProfit = calcProfit(currentPrice, totalCost);
  const simProfit = calcProfit(simulatedPrice, totalCost);
  const curMargin = calcMarginPercent(currentPrice, totalCost);
  const simMargin = calcMarginPercent(simulatedPrice, totalCost);
  const curMarkup = calcMarkupPercent(currentPrice, totalCost);
  const simMarkup = calcMarkupPercent(simulatedPrice, totalCost);
  const diffProfit = simProfit - curProfit;
  const diffMargin = simMargin - curMargin;
  const minPrice = calcMinPrice(totalCost);
  const suggested = calcAllSuggestedPrices(totalCost);
  const simStatus = calcProductStatus(simMargin);

  const handleSave = async () => {
    if (totalCost <= 0 || simulatedPrice <= 0) {
      toast.error("Preencha custo e preço simulado antes de salvar");
      return;
    }
    setSaving(true);
    try {
      await pricingSimulationService.saveSimulation({
        product_id: selectedProductId || null,
        current_price: currentPrice,
        simulated_price: simulatedPrice,
        current_profit: curProfit,
        simulated_profit: simProfit,
        current_margin: curMargin,
        simulated_margin: simMargin,
        notes: null,
      });
      toast.success("Simulação salva com sucesso!");
    } catch {
      toast.error("Erro ao salvar simulação");
    } finally {
      setSaving(false);
    }
  };

  const activeProducts = products.filter((p) => p.is_active);

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === "product" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("product")}
          className="gap-1.5"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Produto Cadastrado</span>
          <span className="sm:hidden">Produto</span>
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("manual")}
          className="gap-1.5"
        >
          <PenLine className="h-4 w-4" />
          <span className="hidden sm:inline">Simulação Manual</span>
          <span className="sm:hidden">Manual</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Dados da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "product" && (
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProducts.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Nenhum produto ativo cadastrado
                      </div>
                    ) : (
                      activeProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Custo Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={totalCost || ""}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                readOnly={mode === "product" && !!selectedProductId}
                className={mode === "product" && selectedProductId ? "bg-muted/50" : ""}
                placeholder="0,00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preço Atual (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentPrice || ""}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  readOnly={mode === "product" && !!selectedProductId}
                  className={mode === "product" && selectedProductId ? "bg-muted/50" : ""}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Simulado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={simulatedPrice || ""}
                  onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Suggested prices quick-fill */}
            {totalCost > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Preencher preço simulado por margem:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggested.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setSimulatedPrice(Number(s.price.toFixed(2)));
                        setSimulated(false);
                      }}
                    >
                      {s.label} → {formatCurrency(s.price)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSimulate} className="w-full" disabled={totalCost <= 0 && currentPrice <= 0 && simulatedPrice <= 0}>
            <Button onClick={handleSimulate} className="w-full" disabled={totalCost <= 0 || (currentPrice <= 0 && simulatedPrice <= 0)}>
              <Calculator className="mr-2 h-4 w-4" /> Simular
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!simulated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {mode === "product" && !selectedProductId
                    ? "Selecione um produto e clique em Simular"
                    : "Preencha os valores e clique em Simular"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <Badge variant={simStatus.variant} className="text-xs">
                    Status Simulado: {simStatus.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Mín: {formatCurrency(minPrice)}
                  </Badge>
                </div>

                {/* Comparison table */}
                <div className="rounded-xl border overflow-hidden">
                  <div className="grid grid-cols-3 text-xs font-semibold bg-muted/50 px-3 py-2">
                    <span>Indicador</span>
                    <span className="text-center">Atual</span>
                    <span className="text-center">Simulado</span>
                  </div>

                  <ComparisonRow label="Preço" current={formatCurrency(currentPrice)} simulated={formatCurrency(simulatedPrice)} />
                  <ComparisonRow label="Lucro/un." current={formatCurrency(curProfit)} simulated={formatCurrency(simProfit)} highlight={simProfit > curProfit} negative={simProfit < curProfit} />
                  <ComparisonRow label="Margem" current={`${curMargin.toFixed(1)}%`} simulated={`${simMargin.toFixed(1)}%`} highlight={simMargin > curMargin} negative={simMargin < curMargin} />
                  <ComparisonRow label="Markup" current={`${curMarkup.toFixed(1)}%`} simulated={`${simMarkup.toFixed(1)}%`} highlight={simMarkup > curMarkup} negative={simMarkup < curMarkup} />
                </div>

                {/* Differences */}
                <div className="grid grid-cols-2 gap-3">
                  <DiffCard label="Diferença Lucro/un." value={formatCurrency(diffProfit)} positive={diffProfit > 0} negative={diffProfit < 0} />
                  <DiffCard label="Diferença Margem" value={`${diffMargin >= 0 ? "+" : ""}${diffMargin.toFixed(1)}pp`} positive={diffMargin > 0} negative={diffMargin < 0} />
                </div>

                {/* Suggested prices */}
                {totalCost > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">Preços Sugeridos por Margem</p>
                      <div className="grid grid-cols-2 gap-2">
                        {suggested.map((s) => {
                          const isAbove = simulatedPrice >= s.price;
                          return (
                            <div key={s.label} className={`rounded-lg border p-2 text-center text-xs ${isAbove ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30"}`}>
                              <span className="text-muted-foreground">Margem {s.label}</span>
                              <p className="font-bold text-sm">{formatCurrency(s.price)}</p>
                              {isAbove && <span className="text-emerald-600 text-[10px]">✓ Atingido</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <Button onClick={handleSave} className="w-full" variant="outline" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar Simulação"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function ComparisonRow({ label, current, simulated, highlight, negative }: { label: string; current: string; simulated: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="grid grid-cols-3 text-sm px-3 py-2 border-t border-border">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-center font-medium tabular-nums">{current}</span>
      <span className={`text-center font-bold tabular-nums ${highlight ? "text-emerald-600" : negative ? "text-destructive" : ""}`}>
        {simulated}
      </span>
    </div>
  );
}

function DiffCard({ label, value, positive, negative }: { label: string; value: string; positive: boolean; negative: boolean }) {
  const Icon = positive ? TrendingUp : negative ? TrendingDown : ArrowRight;
  return (
    <div className={`rounded-xl border p-3 text-center ${positive ? "bg-emerald-500/5 border-emerald-500/20" : negative ? "bg-destructive/5 border-destructive/20" : ""}`}>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        <Icon className={`h-3.5 w-3.5 ${positive ? "text-emerald-600" : negative ? "text-destructive" : "text-muted-foreground"}`} />
        <span className={`text-base font-bold ${positive ? "text-emerald-600" : negative ? "text-destructive" : ""}`}>{value}</span>
      </div>
    </div>
  );
}
