import { useFinance } from "@/contexts";
import { usePlan } from "@/hooks/usePlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, FileSpreadsheet, Shield, Trophy, ExternalLink, Crown, Sparkles, Target, Wallet, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const { userSettings } = useFinance();
  const { plan, isMaster, expirationDate } = usePlan();
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

  const masterExclusiveFeatures = [
    {
      icon: Wallet,
      title: "Múltiplas Carteiras",
      description: "Gerencie diferentes contas e categorize seus recursos"
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Defina e acompanhe suas metas de economia e investimento"
    },
    {
      icon: BarChart3,
      title: "Dashboard Premium Master",
      description: "Insights avançados com análises de margem, break-even e comparativos"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background border border-primary/30 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20 backdrop-blur-sm">
              {isMaster ? (
                <Crown className="h-10 w-10 text-primary" />
              ) : (
                <Trophy className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                Bem-vindo ao {isMaster ? 'Premium Master' : 'Premium'}
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </h1>
              <p className="text-muted-foreground mt-2">
                Obrigado por confiar em nós! Aproveite todos os recursos exclusivos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Status da Assinatura */}
      {userSettings.subscriptionEnd && (
        <Card className="border-primary/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {isMaster ? (
                    <>
                      <Crown className="h-6 w-6 text-primary" />
                      Plano Premium Master
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      Plano Premium
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Validade até: <strong className="text-foreground">{formatExpirationDate(userSettings.subscriptionEnd)}</strong>
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => window.open('https://kiwify.app/login', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Gerenciar Assinatura na Kiwify
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card de Upgrade/Status */}
      {!isMaster ? (
        <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-7 w-7 text-primary" />
              Leve seu Negócio ao Nível Master
            </CardTitle>
            <CardDescription className="text-base">
              Desbloqueie funcionalidades exclusivas e insights ainda mais poderosos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {masterExclusiveFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <feature.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full md:w-auto"
              onClick={() => navigate('/upgrade')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Fazer Upgrade para Premium Master
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-primary/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-7 w-7 text-primary" />
              Você está no Topo!
            </CardTitle>
            <CardDescription className="text-base">
              Aproveite todos os benefícios exclusivos do Premium Master
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {masterExclusiveFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-primary/20">
                  <feature.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funcionalidades Premium */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recursos Incluídos no Seu Plano</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-3">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Navegação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido às Funcionalidades</CardTitle>
          <CardDescription>
            Navegue pelas principais áreas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => navigate('/transacoes')}
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Transações</div>
              <div className="text-xs text-muted-foreground">Gerenciar lançamentos ilimitados</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => navigate('/relatorios')}
          >
            <FileSpreadsheet className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Relatórios</div>
              <div className="text-xs text-muted-foreground">Análises e exportações avançadas</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Dashboard</div>
              <div className="text-xs text-muted-foreground">Visão completa das finanças</div>
            </div>
          </Button>
          {isMaster && (
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4"
              onClick={() => navigate('/metas-financeiras')}
            >
              <Target className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Metas Financeiras</div>
                <div className="text-xs text-muted-foreground">Defina e acompanhe objetivos</div>
              </div>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Premium;
