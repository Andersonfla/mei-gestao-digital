import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";

export function PriceSimulator() {
  const [costPrice, setCostPrice] = useState(0);
  const [fixedCosts, setFixedCosts] = useState(0);
  const [variableCosts, setVariableCosts] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [desiredMargin, setDesiredMargin] = useState(30);
  const [result, setResult] = useState<{ suggestedPrice: number; profit: number } | null>(null);

  const simulate = () => {
    const totalCost = costPrice + fixedCosts + variableCosts + laborCost;
    const suggestedPrice = totalCost * (1 + desiredMargin / 100);
    const profit = suggestedPrice - totalCost;
    setResult({ suggestedPrice, profit });
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            Dados do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Custo do Produto/Serviço (R$)</Label>
            <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Custos Fixos (R$)</Label>
              <Input type="number" step="0.01" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Custos Variáveis (R$)</Label>
              <Input type="number" step="0.01" value={variableCosts} onChange={(e) => setVariableCosts(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mão de Obra (R$)</Label>
              <Input type="number" step="0.01" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Margem Desejada (%)</Label>
              <Input type="number" step="0.1" value={desiredMargin} onChange={(e) => setDesiredMargin(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={simulate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calcular Preço Sugerido
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Resultado da Simulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(result.suggestedPrice)}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-sm text-muted-foreground mb-1">Lucro por Unidade</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.profit)}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Custo Total</p>
                <p className="text-xl font-semibold">{formatCurrency(costPrice + fixedCosts + variableCosts + laborCost)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Preencha os dados e clique em calcular para ver o preço sugerido</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
