
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
      <h1 className="text-3xl font-bold">Assinar MEI Finanças</h1>
      <p className="text-muted-foreground max-w-2xl">
        Assine o MEI Finanças e tenha acesso a todas as ferramentas para gerenciamento financeiro do seu MEI
      </p>
      
      <PlanUpgrade />
      
      <div className="pt-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Como funciona a assinatura?</h3>
            <p className="text-muted-foreground">
              A assinatura do MEI Finanças é cobrada mensalmente no valor de R$ 19,90. Seu acesso é renovado automaticamente a cada período.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Posso cancelar a assinatura a qualquer momento?</h3>
            <p className="text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará válido até o final do período pago.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Quais formas de pagamento são aceitas?</h3>
            <p className="text-muted-foreground">
              Aceitamos cartões de crédito de todas as bandeiras através de nossa integração segura com o Stripe.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Existe algum período de teste?</h3>
            <p className="text-muted-foreground">
              No momento não oferecemos período de teste gratuito, mas oferecemos garantia de reembolso nos primeiros 7 dias após a assinatura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
