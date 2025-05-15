
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
              O plano gratuito oferece acesso à maioria das funcionalidades, porém com um limite de 50 lançamentos por mês.
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
              Aceitamos cartões de crédito de todas as bandeiras e Pix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
