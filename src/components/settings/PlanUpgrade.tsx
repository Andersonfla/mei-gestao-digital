
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";

export function PlanUpgrade() {
  const { userSettings, upgradeToPremium } = useFinance();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Check for payment success/canceled parameters in URL
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      handlePaymentVerification();
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive"
      });
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);
  
  const handlePaymentVerification = async () => {
    try {
      // Call the verify-payment edge function
      const { error } = await supabase.functions.invoke('verify-payment');
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      upgradeToPremium();
      
      toast({
        title: "Pagamento confirmado!",
        description: "Seu plano foi atualizado para Premium com sucesso!",
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Erro ao verificar pagamento",
        description: "Ocorreu um problema ao verificar seu pagamento. Por favor, contate o suporte.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Call the create-checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
      setIsUpgrading(false);
    }
  };
  
  const freePlanFeatures = [
    "Limite de 20 lançamentos/mês", 
    "Acesso ao dashboard",
    "Relatórios básicos",
    "Categorização de transações",
  ];
  
  const premiumPlanFeatures = [
    "Lançamentos ilimitados",
    "Acesso ao dashboard",
    "Relatórios avançados",
    "Categorização de transações",
    "Exportação de relatórios",
    "Suporte prioritário",
  ];
  
  if (userSettings.plan === 'premium') {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-primary shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary">Plano Premium</CardTitle>
            <CardDescription>Você já está aproveitando todos os benefícios do plano Premium!</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {premiumPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Plano Gratuito</CardTitle>
            <CardDescription>Seu plano atual</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            <div className="text-3xl font-bold mb-4">Grátis</div>
            <ul className="space-y-2">
              {freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 border-t">
            <div className="text-sm text-muted-foreground">
              {userSettings.transactionCountThisMonth} / {userSettings.transactionLimit} lançamentos usados
            </div>
          </CardFooter>
        </Card>
        
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
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleUpgrade} 
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processando..." : "Fazer Upgrade Agora"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
