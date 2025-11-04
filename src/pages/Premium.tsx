import { useFinance } from "@/contexts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, FileSpreadsheet, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const { userSettings } = useFinance();
  const navigate = useNavigate();

  const formatExpirationDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const premiumFeatures = [
    {
      icon: TrendingUp,
      title: "Lançamentos Ilimitados",
      description: "Registre quantas transações quiser, sem limites mensais"
    },
    {
      icon: FileSpreadsheet,
      title: "Relatórios Avançados",
      description: "Acesse relatórios detalhados e exportação em diversos formatos"
    },
    {
      icon: Shield,
      title: "Suporte Prioritário",
      description: "Tenha atendimento rápido e personalizado quando precisar"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          Área Premium
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Você está aproveitando todos os recursos exclusivos do plano Premium
        </p>
      </div>

      {userSettings.subscriptionEnd && (
        <Card className="max-w-2xl mx-auto border-primary/50">
          <CardHeader>
            <CardTitle>Seu Plano Premium</CardTitle>
            <CardDescription>
              Validade até: <strong>{formatExpirationDate(userSettings.subscriptionEnd)}</strong>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {premiumFeatures.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Explore as Funcionalidades Premium</CardTitle>
          <CardDescription>
            Aproveite ao máximo o seu plano navegando pelas áreas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/transacoes')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Gerenciar Transações Ilimitadas
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/relatorios')}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Acessar Relatórios Avançados
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Premium;
