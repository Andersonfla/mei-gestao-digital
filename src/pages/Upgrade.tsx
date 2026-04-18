
import { PlanUpgrade } from "@/components/settings/PlanUpgrade";

const Upgrade = () => {

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upgrade de Plano</h1>
      <p className="text-muted-foreground max-w-2xl">
        Desbloqueie recursos premium e aproveite ao máximo o sistema de gerenciamento financeiro para seu MEI
      </p>
      
      <PlanUpgrade />
      
      <div className="pt-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Como funciona o plano gratuito?</h3>
            <p className="text-muted-foreground">
              O plano gratuito oferece acesso à maioria das funcionalidades, porém com um limite de 20 lançamentos por mês.
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
              Aceitamos cartão de crédito via Stripe. O pagamento é processado de forma segura e você pode gerenciar, atualizar ou cancelar sua assinatura a qualquer momento pelo portal do cliente.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Como cancelo minha assinatura?</h3>
            <p className="text-muted-foreground">
              No card do seu plano atual, clique em "Gerenciar assinatura" para abrir o portal seguro do Stripe. Lá você pode cancelar — o acesso continua até o fim do período já pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
