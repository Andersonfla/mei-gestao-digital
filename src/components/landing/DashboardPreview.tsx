import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

// Deliberately local fixtures: never read the user's session or financial data.
const transactions = [
  { description: "Serviços prestados", category: "Serviços", amount: 1800, date: "21/11" },
  { description: "Compra de materiais", category: "Materiais", amount: -420, date: "20/11" },
  { description: "Venda de produtos", category: "Vendas", amount: 950, date: "19/11" },
];

export function DashboardPreview() {
  return (
    <section id="previa-dashboard" aria-label="Prévia do dashboard com dados demonstrativos" className="scroll-mt-28 mx-auto max-w-5xl text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-sm font-medium text-foreground">MEI Finanças · Dashboard</span>
        <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-md">Demonstração · dados fictícios</span>
      </div>
      <div className="border border-border bg-muted/40 rounded-xl p-4 sm:p-6 shadow-lg space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-normal">Visão geral</h2>
            <p className="text-sm text-muted-foreground">Resultado do período</p>
          </div>
          <span className="text-xs text-muted-foreground">Novembro · exemplo</span>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Saldo Total", value: 3200, icon: Wallet, color: "text-foreground" },
            { label: "Receitas", value: 8400, icon: ArrowUpRight, color: "text-secondary" },
            { label: "Despesas", value: 5200, icon: ArrowDownLeft, color: "text-destructive" },
            { label: "Lucro/Prejuízo", value: 3200, icon: ArrowUpRight, color: "text-secondary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3"><span className="text-xs text-muted-foreground">{label}</span><Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${color}`} /></div>
                <p className={`text-2xl font-semibold tabular-nums ${color}`}>{formatCurrency(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Receitas e despesas por semana</h3>
            <div className="flex gap-4 text-xs text-muted-foreground"><span><span className="inline-block w-2 h-2 bg-secondary mr-1 rounded-sm" />Receitas</span><span><span className="inline-block w-2 h-2 bg-destructive mr-1 rounded-sm" />Despesas</span></div>
            <div className="grid grid-cols-4 gap-4 items-end h-36 border-b border-border" role="img" aria-label="Exemplo semanal: receitas de 1.800, 2.400, 2.100 e 2.100 reais; despesas de 1.200, 1.500, 1.400 e 1.100 reais.">
              {[
                ["h-[60%]", "h-[40%]"], ["h-[80%]", "h-[50%]"], ["h-[70%]", "h-[47%]"], ["h-[70%]", "h-[37%]"],
              ].map(([income, expense], i) => <div key={i} className="flex items-end justify-center gap-2 h-full"><div className={`bg-secondary w-5 sm:w-7 rounded-t-sm ${income}`} /><div className={`bg-destructive/70 w-5 sm:w-7 rounded-t-sm ${expense}`} /></div>)}
            </div>
            <div className="grid grid-cols-4 text-xs text-muted-foreground text-center">{[1, 2, 3, 4].map(week => <span key={week}>Semana {week}</span>)}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Últimas transações</h3>
            <ul className="divide-y divide-border">
              {transactions.map(row => <li key={row.description} className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-foreground">{row.description}</p><p className="text-xs text-muted-foreground">{row.date} · {row.category}</p></div><span className={`text-sm font-semibold shrink-0 tabular-nums ${row.amount > 0 ? "text-secondary" : "text-destructive"}`}>{formatCurrency(row.amount)}</span></li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}