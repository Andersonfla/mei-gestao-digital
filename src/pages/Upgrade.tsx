
import { PlanUpgrade } from "@/components/settings/PlanUpgrade";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Upgrade = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Show toast messages based on URL parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Processando pagamento",
        description: "Estamos verificando seu pagamento...",
      });
    } else if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Plano Premium</h1>
      <p className="text-muted-foreground max-w-2xl">
        Desbloqueie recursos premium e aproveite ao máximo o sistema de gerenciamento financeiro para seu MEI
      </p>
      
      <PlanUpgrade />
      
      <div className="pt-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Como funciona o plano premium?</h3>
            <p className="text-muted-foreground">
              O plano premium oferece acesso a todas as funcionalidades, sem limitações de lançamentos por mês.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Posso cancelar o plano premium a qualquer momento?</h3>
            <p className="text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento. O acesso premium continuará válido até o final do período pago.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Quais formas de pagamento são aceitas?</h3>
            <p className="text-muted-foreground">
              Aceitamos cartões de crédito de todas as bandeiras através de nossa integração segura com o Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
