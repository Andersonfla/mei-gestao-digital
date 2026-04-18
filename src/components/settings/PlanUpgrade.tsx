import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useFinance } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_FEATURE_LIST, MASTER_FEATURE_LIST } from "@/lib/planPermissions";

export function PlanUpgrade() {
  const { userSettings, isPremiumActive, isPremiumMasterActive } = useFinance();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<"premium" | "master" | null>(null);

  const handleSubscribe = async (plan: "premium" | "master") => {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não recebida");
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro ao criar checkout:", err);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar pagamento",
        description:
          err instanceof Error
            ? err.message
            : "Não foi possível abrir o checkout. Tente novamente.",
      });
      setLoadingPlan(null);
    }
  };

  const handleSubscribePremium = () => handleSubscribe("premium");
  const handleSubscribeMaster = () => handleSubscribe("master");

  // Formatar a data de expiração
  const formatExpirationDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const premiumPlanFeatures = PREMIUM_FEATURE_LIST;
  const premiumMasterFeatures = MASTER_FEATURE_LIST;

  // Se for plano Master, exibir tela com status
  if (userSettings.plan === 'master') {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className={`border-2 ${isPremiumMasterActive ? 'border-primary' : 'border-yellow-500'} shadow-sm`}>
          <CardHeader>
            <CardTitle className={isPremiumMasterActive ? 'text-primary' : 'text-yellow-600'}>
              {isPremiumMasterActive ? 'Plano Premium Master' : 'Plano Premium Master (Expirado)'}
            </CardTitle>
            <CardDescription>
              {isPremiumMasterActive ? (
                <>Você está aproveitando todos os benefícios do plano Premium Master!</>
              ) : (
                <>Seu plano Premium Master expirou. Renove agora para continuar com acesso a todos os recursos.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userSettings.subscriptionEnd && (
              <div className={`mb-4 p-3 rounded-md ${
                isPremiumMasterActive ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
                <p>
                  <strong>{isPremiumMasterActive ? 'Validade do seu plano:' : 'Seu plano expirou em:'}</strong><br />
                  {formatExpirationDate(userSettings.subscriptionEnd)}
                </p>
              </div>
            )}
            <ul className="space-y-2">
              {premiumMasterFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          {!isPremiumMasterActive && (
            <CardFooter>
              <Button className="w-full" onClick={handleSubscribeMaster} disabled={loadingPlan !== null}>
                {loadingPlan === "master" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecionando...</>) : "Renovar Plano Premium Master"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  if (userSettings.plan === 'premium') {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Card de Status Premium */}
        <Card className={`border-2 ${isPremiumActive ? 'border-primary' : 'border-yellow-500'} shadow-sm mb-6`}>
          <CardHeader>
            <CardTitle className={isPremiumActive ? 'text-primary' : 'text-yellow-600'}>
              {isPremiumActive ? 'Plano Premium' : 'Plano Premium (Expirado)'}
            </CardTitle>
            <CardDescription>
              {isPremiumActive ? (
                <>Você está aproveitando todos os benefícios do plano Premium!</>
              ) : (
                <>Seu plano Premium expirou. Renove agora para continuar com acesso a todos os recursos.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userSettings.subscriptionEnd && (
              <div className={`mb-4 p-3 rounded-md ${
                isPremiumActive ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
                <p>
                  <strong>{isPremiumActive ? 'Validade do seu plano:' : 'Seu plano expirou em:'}</strong><br />
                  {formatExpirationDate(userSettings.subscriptionEnd)}
                </p>
              </div>
            )}
            <ul className="space-y-2">
              {premiumPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          {!isPremiumActive && (
            <CardFooter>
              <Button className="w-full" onClick={handleSubscribePremium} disabled={loadingPlan !== null}>
                {loadingPlan === "premium" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecionando...</>) : "Renovar Plano Premium"}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Card de Upgrade para Premium Master */}
        <Card className="border-2 border-primary shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Upgrade Disponível
          </div>
          <CardHeader>
            <CardTitle className="text-primary">Plano Premium Master</CardTitle>
            <CardDescription>Desbloqueie recursos profissionais completos</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            <div className="text-3xl font-bold mb-4">R$ 29,90<span className="text-base font-normal">/mês</span></div>
            <ul className="space-y-2">
              {premiumMasterFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubscribeMaster} disabled={loadingPlan !== null}>
              {loadingPlan === "master" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecionando...</>) : "Assinar Master"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-primary shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary">Plano Premium</CardTitle>
            <CardDescription>Desbloqueie recursos avançados</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            <div className="text-3xl font-bold mb-4">R$ 19,90<span className="text-base font-normal">/mês</span></div>
            <ul className="space-y-2">
              {premiumPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubscribePremium} disabled={loadingPlan !== null}>
              {loadingPlan === "premium" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecionando...</>) : "Assinar Premium"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Recomendado
          </div>
          <CardHeader>
            <CardTitle className="text-primary">Plano Premium Master</CardTitle>
            <CardDescription>Recursos profissionais completos</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            <div className="text-3xl font-bold mb-4">R$ 29,90<span className="text-base font-normal">/mês</span></div>
            <ul className="space-y-2">
              {premiumMasterFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubscribeMaster} disabled={loadingPlan !== null}>
              {loadingPlan === "master" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecionando...</>) : "Assinar Master"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
