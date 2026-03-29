import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Receipt, Target } from "lucide-react";

export function TicketSimulator() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [targetTicket, setTargetTicket] = useState(0);
  const [result, setResult] = useState<{ averageTicket: number; gap: number } | null>(null);

  const simulate = () => {
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const gap = targetTicket - averageTicket;
    setResult({ averageTicket, gap });
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Dados de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Receita Total do Período (R$)</Label>
            <Input type="number" step="0.01" value={totalRevenue} onChange={(e) => setTotalRevenue(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Número de Vendas</Label>
            <Input type="number" value={totalSales} onChange={(e) => setTotalSales(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Ticket Médio Desejado (R$)</Label>
            <Input type="number" step="0.01" value={targetTicket} onChange={(e) => setTargetTicket(Number(e.target.value))} />
          </div>
          <Button onClick={simulate} className="w-full">
            <Target className="mr-2 h-4 w-4" /> Simular Ticket Médio
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-violet-600" />
            Resultado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Ticket Médio Atual</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(result.averageTicket)}</p>
              </div>
              {targetTicket > 0 && (
                <div className={`p-4 rounded-xl border ${result.gap <= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                  <p className="text-sm text-muted-foreground mb-1">
                    {result.gap <= 0 ? "✅ Meta atingida!" : "📊 Falta para a meta"}
                  </p>
                  <p className={`text-2xl font-bold ${result.gap <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {formatCurrency(Math.abs(result.gap))}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Meta de Ticket</p>
                <p className="text-xl font-semibold">{formatCurrency(targetTicket)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Preencha os dados de vendas para simular o ticket médio</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
