import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts";

const Thanks = () => {
  const navigate = useNavigate();
  const { userSettings } = useFinance();

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
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Obrigado!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Assim que seu pagamento for confirmado, seu plano será ativado automaticamente.
        </p>
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium">Status atual</h3>
            <p className="text-sm text-muted-foreground">
              Plano: <strong>{userSettings?.plan || 'free'}</strong>
              {userSettings?.subscriptionEnd && (
                <> · Validade: <strong>{formatExpirationDate(userSettings.subscriptionEnd)}</strong></>
              )}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-medium">Precisa de ajuda?</h3>
            <p className="text-sm text-muted-foreground">
              Em caso de dúvidas sobre o seu plano, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button onClick={() => navigate("/dashboard")}>Ir para o Dashboard</Button>
        <Button variant="outline" onClick={() => navigate("/configuracoes")}>
          Ver minha conta
        </Button>
      </div>
    </div>
  );
};

export default Thanks;
