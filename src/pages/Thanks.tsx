
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const Thanks = () => {
  const navigate = useNavigate();
  const { userSettings, refetchUserSettings } = useFinance();

  useEffect(() => {
    // Atualiza as configurações do usuário para garantir que temos os dados mais recentes
    refetchUserSettings();
    
    // Pixel do Facebook
    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "Purchase", {
        value: 19.90,
        currency: "BRL",
      });
    }
  }, [refetchUserSettings]);
  
  // Formatar a data de expiração da assinatura
  const formatExpirationDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="mb-8">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-primary-foreground" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Obrigado pela sua compra!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Seu pagamento foi processado com sucesso. Aproveite todos os recursos do Plano Premium!
        </p>
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium">O que esperar agora?</h3>
            <p className="text-sm text-muted-foreground">
              Seu plano Premium já está ativado! Você tem acesso imediato a todas as funcionalidades premium.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium">Duração da sua assinatura</h3>
            <p className="text-sm text-muted-foreground">
              Seu plano Premium expira em: <strong>{formatExpirationDate(userSettings?.subscriptionEnd)}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Após essa data, você será rebaixado automaticamente para o plano gratuito. Para continuar 
              usando recursos premium, renove sua assinatura antes da data de expiração.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium">Precisa de ajuda?</h3>
            <p className="text-sm text-muted-foreground">
              Se tiver alguma dúvida sobre o seu plano, entre em contato com o nosso suporte.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button onClick={() => navigate("/")}>
          Ir para o Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          Ir para Configurações
        </Button>
      </div>
    </div>
  );
};

export default Thanks;
