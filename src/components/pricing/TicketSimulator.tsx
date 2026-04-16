import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Receipt, Target, TrendingUp, TrendingDown, Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { usePricingProducts } from "@/hooks/usePricingProducts";
import { calcTotalCost, calcMarginPercent, calcProfit } from "@/lib/pricingCalculations";
import { formatCurrency } from "@/lib/formatters";

type Mode = "product" | "manual";

interface SimResult {
  totalCost: number;
  currentProfit: number;
  simulatedProfit: number;
  currentMargin: number;
  simulatedMargin: number;
  profitDiff: number;
  newAverageTicket: number;
  ticketImpact: number;
  recommendations: { type: "success" | "warning" | "info" | "danger"; message: string }[];
}

function buildRecommendations(args: {
  currentMargin: number;
  simulatedMargin: number;
  sharePercent: number;
  currentPrice: number;
  totalCost: number;
  simulatedPrice: number;
  profitDiff: number;
  ticketImpactPercent: number;
}): SimResult["recommendations"] {
  const recs: SimResult["recommendations"] = [];
  const { currentMargin, simulatedMargin, sharePercent, currentPrice, totalCost, simulatedPrice, profitDiff, ticketImpactPercent } = args;

  // Prejuízo no preço atual
  if (currentPrice > 0 && currentPrice < totalCost) {
    recs.push({
      type: "danger",
      message: "⚠️ Atenção: seu produto principal está sendo vendido abaixo do custo total. Você está tendo prejuízo a cada venda.",
    });
  }

  // Alta participação + margem baixa
  if (sharePercent >= 30 && currentMargin < 20 && currentMargin >= 0) {
    recs.push({
      type: "warning",
      message: "Esse produto tem alta participação nas vendas e margem baixa, então pode estar puxando seu lucro para baixo.",
    });
  }

  // Produto saudável
  if (currentMargin >= 25 && sharePercent >= 20) {
    recs.push({
      type: "success",
      message: "✅ Seu produto principal está saudável e contribui bem para o resultado do seu negócio.",
    });
  }

  // Produto muito barato em relação ao custo
  if (currentPrice > 0 && currentMargin < 10 && currentMargin >= 0) {
    recs.push({
      type: "warning",
      message: "Atenção: seu produto principal parece muito barato em relação ao custo total. Considere revisar o preço.",
    });
  }

  // Simulação melhora margem sem grande impacto no ticket
  if (simulatedMargin > currentMargin && Math.abs(ticketImpactPercent) <= 10 && profitDiff > 0) {
    recs.push({
      type: "info",
      message: "💡 Um pequeno aumento de preço pode melhorar sua margem sem alterar drasticamente o ticket médio.",
    });
  }

  // Simulação piora resultado
  if (simulatedPrice > 0 && profitDiff < 0) {
    recs.push({
      type: "warning",
      message: "O preço simulado reduz seu lucro por unidade. Avalie se vale a pena para ganhar competitividade.",
    });
  }

  // Grande melhora de margem
  if (simulatedMargin - currentMargin >= 10) {
    recs.push({
      type: "success",
      message: `Com o novo preço, sua margem sobe ${(simulatedMargin - currentMargin).toFixed(1)} pontos percentuais. Excelente impacto na lucratividade!`,
    });
  }

  // Default se nenhuma regra disparou
  if (recs.length === 0 && simulatedPrice > 0) {
    recs.push({
      type: "info",
      message: "A simulação foi calculada. Ajuste o preço simulado para ver diferentes cenários.",
    });
  }

  return recs;
}

export function TicketSimulator() {
  const { products } = usePricingProducts();
  const [mode, setMode] = useState<Mode>("product");

  // Common inputs
  const [averageTicket, setAverageTicket] = useState(0);
  const [productPrice, setProductPrice] = useState(0);
  const [productCost, setProductCost] = useState(0);
  const [sharePercent, setSharePercent] = useState(0);
  const [simulatedPrice, setSimulatedPrice] = useState(0);
  const [productName, setProductName] = useState("");

  // Product mode
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      const cost = calcTotalCost(p);
      setProductName(p.name);
      setProductPrice(p.sale_price || 0);
      setProductCost(cost);
      setSharePercent(p.sales_share_percent || 0);
      setSimulatedPrice(p.sale_price || 0);
    }
  };

  const result = useMemo<SimResult | null>(() => {
    if (productPrice <= 0 || productCost < 0) return null;

    const currentProfit = calcProfit(productPrice, productCost);
    const simulatedProfit = simulatedPrice > 0 ? calcProfit(simulatedPrice, productCost) : currentProfit;
    const currentMargin = calcMarginPercent(productPrice, productCost);
    const simulatedMargin = simulatedPrice > 0 ? calcMarginPercent(simulatedPrice, productCost) : currentMargin;
    const profitDiff = simulatedProfit - currentProfit;

    // Impacto no ticket médio: mudança proporcional pela participação
    const priceDelta = (simulatedPrice || productPrice) - productPrice;
    const newAverageTicket = averageTicket + priceDelta * (sharePercent / 100);
    const ticketImpact = newAverageTicket - averageTicket;
    const ticketImpactPercent = averageTicket > 0 ? (ticketImpact / averageTicket) * 100 : 0;

    const recommendations = buildRecommendations({
      currentMargin,
      simulatedMargin,
      sharePercent,
      currentPrice: productPrice,
      totalCost: productCost,
      simulatedPrice,
      profitDiff,
      ticketImpactPercent,
    });

    return {
      totalCost: productCost,
      currentProfit,
      simulatedProfit,
      currentMargin,
      simulatedMargin,
      profitDiff,
      newAverageTicket,
      ticketImpact,
      recommendations,
    };
  }, [productPrice, productCost, simulatedPrice, averageTicket, sharePercent]);

  const recIcon = (type: "success" | "warning" | "info" | "danger") => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />;
      case "danger": return <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />;
      default: return <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />;
    }
  };

  const recBg = (type: "success" | "warning" | "info" | "danger") => {
    switch (type) {
      case "success": return "bg-emerald-500/5 border-emerald-500/20";
      case "warning": return "bg-amber-500/5 border-amber-500/20";
      case "danger": return "bg-destructive/5 border-destructive/20";
      default: return "bg-primary/5 border-primary/20";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Simulador de Ticket Médio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Descubra se seu produto mais vendido está ajudando ou prejudicando seu lucro.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product">Produto Cadastrado</TabsTrigger>
              <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Selecione o produto mais vendido</Label>
                <Select value={selectedProductId} onValueChange={handleSelectProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um produto cadastrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground">Nenhum produto cadastrado</div>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Nome do produto mais vendido</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: X-Burger" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label>Ticket Médio Atual (R$)</Label>
              <Input type="number" step="0.01" value={averageTicket || ""} onChange={(e) => setAverageTicket(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Participação do produto nas vendas (%)</Label>
              <Input type="number" step="0.1" min="0" max="100" value={sharePercent || ""} onChange={(e) => setSharePercent(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Preço atual do produto (R$)</Label>
              <Input type="number" step="0.01" value={productPrice || ""} onChange={(e) => setProductPrice(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Custo total do produto (R$)</Label>
              <Input type="number" step="0.01" value={productCost || ""} onChange={(e) => setProductCost(Number(e.target.value))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Novo preço simulado (R$)</Label>
              <Input type="number" step="0.01" value={simulatedPrice || ""} onChange={(e) => setSimulatedPrice(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparação Atual vs Simulado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-violet-600" />
                Comparação de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Lucro Atual</p>
                  <p className="text-lg font-bold">{formatCurrency(result.currentProfit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Margem: {result.currentMargin.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Lucro Simulado</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(result.simulatedProfit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Margem: {result.simulatedMargin.toFixed(1)}%</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${result.profitDiff >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-destructive/5 border-destructive/20"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {result.profitDiff >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <p className="text-sm text-muted-foreground">Diferença de lucro por unidade</p>
                </div>
                <p className={`text-2xl font-bold ${result.profitDiff >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {result.profitDiff >= 0 ? "+" : ""}{formatCurrency(result.profitDiff)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border">
                <p className="text-sm text-muted-foreground mb-1">Novo Ticket Médio Estimado</p>
                <p className="text-xl font-semibold">{formatCurrency(result.newAverageTicket)}</p>
                <p className={`text-xs mt-1 ${result.ticketImpact >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  Impacto: {result.ticketImpact >= 0 ? "+" : ""}{formatCurrency(result.ticketImpact)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className={`p-3 rounded-lg border flex gap-3 ${recBg(rec.type)}`}>
                  {recIcon(rec.type)}
                  <p className="text-sm leading-relaxed">{rec.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {!result && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Info className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Preencha o preço e o custo do produto para iniciar a simulação</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
