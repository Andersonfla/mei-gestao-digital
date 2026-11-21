import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { PLAN_LABELS, PLAN_PRICES, FREE_TRANSACTION_LIMIT } from "@/lib/planPermissions";
import { formatCurrency } from "@/lib/formatters";
import { UserPlan } from "@/types/finance";

const plans: { plan: UserPlan; description: string; features: string[] }[] = [
  { plan: "free", description: "Para começar a organizar suas contas", features: [`Até ${FREE_TRANSACTION_LIMIT} lançamentos por mês`, "Dashboard de receitas, despesas e resultado", "Relatórios básicos", "Categorização de transações"] },
  { plan: "premium", description: "Para registrar sem limite mensal", features: ["Lançamentos ilimitados", "Tudo do plano Gratuito", "Categorias adicionais de despesas", "Exportação de relatórios em PDF", "Acesso ao suporte prioritário"] },
  { plan: "master", description: "Para analisar e planejar seu negócio", features: ["Tudo do plano Premium", "Dashboard avançado com margem e ponto de equilíbrio", "Categorias adicionais de receitas", "Exportações em CSV e Excel", "Metas financeiras e análise automática", "Precificação e transações recorrentes"] },
];

export const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section id="planos" className="py-16 sm:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-normal">Um plano para cada momento do seu MEI</h2>
          <p className="text-base text-muted-foreground">Comece gratuitamente. Escolha mais recursos quando precisar.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(({ plan, description, features }) => (
            <article key={plan} className={`bg-card border rounded-lg p-6 flex flex-col ${plan === "premium" ? "border-primary shadow-md" : "border-border shadow-sm"}`}>
              <h3 className="text-xl font-semibold text-foreground tracking-normal">{PLAN_LABELS[plan]}</h3>
              <p className="text-sm text-muted-foreground mt-2 min-h-10">{description}</p>
              <p className="my-6"><span className="text-3xl font-semibold text-foreground tabular-nums">{plan === "free" ? "R$ 0" : formatCurrency(PLAN_PRICES[plan])}</span><span className="text-sm text-muted-foreground">/mês</span></p>
              <ul className="space-y-3 flex-1 mb-7">
                {features.map(feature => <li key={feature} className="flex items-start gap-2 text-sm text-foreground"><Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" aria-hidden="true" /><span>{feature}</span></li>)}
              </ul>
              <Button variant={plan === "free" ? "outline" : "default"} className={plan === "free" ? "w-full" : "w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"} onClick={() => navigate(user ? plan === "free" ? "/dashboard" : "/upgrade" : "/auth?tab=signup")}>
                {plan === "free" ? user ? "Ir para o Dashboard" : "Começar Gratuitamente" : `Assinar ${PLAN_LABELS[plan]}`}
              </Button>
            </article>
          ))}
        </div>
        {!user && <p className="text-center text-xs text-muted-foreground mt-5">Crie sua conta gratuita para começar. As assinaturas estão disponíveis em Planos, dentro da sua conta.</p>}
      </div>
    </section>
  );
};
