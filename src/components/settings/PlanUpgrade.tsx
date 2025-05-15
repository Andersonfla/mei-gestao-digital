
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { useState } from "react";

export function PlanUpgrade() {
  const { userSettings, upgradeToPremium } = useFinance();
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Simulating payment process
    await new Promise(resolve => setTimeout(resolve, 1500));
    upgradeToPremium();
    setIsUpgrading(false);
  };
  
  const freePlanFeatures = [
    "Limite de 50 lançamentos/mês",
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
