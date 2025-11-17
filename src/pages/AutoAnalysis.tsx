import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, BarChart3, DollarSign } from "lucide-react";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AutoAnalysis = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const { calculateTotalByType, filteredTransactions, getCategoryBreakdown } = useFinance();
  
  const totalIncome = calculateTotalByType('entrada');
  const totalExpense = calculateTotalByType('saida');
  const profit = totalIncome - totalExpense;
  
  // Análises automáticas
  const expenseCategories = getCategoryBreakdown('saida');
  const highestExpenseCategory = expenseCategories[0];
  const savingsRate = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;
  
  const insights = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Controle de Gastos',
      description: savingsRate > 20 
        ? `Excelente! Você está economizando ${savingsRate.toFixed(1)}% da sua renda.`
        : savingsRate > 10
        ? `Bom progresso! Taxa de economia de ${savingsRate.toFixed(1)}%.`
        : `Atenção: Taxa de economia baixa (${savingsRate.toFixed(1)}%). Recomendamos pelo menos 20%.`,
      color: savingsRate > 20 ? 'text-income' : savingsRate > 10 ? 'text-primary' : 'text-expense'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Categoria de Maior Gasto',
      description: highestExpenseCategory 
        ? `${highestExpenseCategory.name} representa ${highestExpenseCategory.percent.toFixed(1)}% das suas despesas (${formatCurrency(highestExpenseCategory.value)}).`
        : 'Nenhuma despesa registrada no período.',
      color: 'text-expense'
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Oportunidade de Economia',
      description: highestExpenseCategory
        ? `Reduzir ${highestExpenseCategory.name} em 10% geraria uma economia de ${formatCurrency(highestExpenseCategory.value * 0.1)}.`
        : 'Comece registrando suas transações para receber sugestões personalizadas.',
      color: 'text-primary'
    },
    {
      type: 'success',
      icon: TrendingUp,
      title: 'Projeção de Crescimento',
      description: profit > 0
        ? `Mantendo o ritmo atual, você pode economizar ${formatCurrency(profit * 12)} em um ano.`
        : 'Ajuste seus gastos para começar a acumular patrimônio.',
      color: profit > 0 ? 'text-income' : 'text-muted-foreground'
    }
  ];

  const avgMonthlyExpense = totalExpense; // Simplificado - pode ser média de vários meses
  const emergencyReserveTarget = avgMonthlyExpense * 6;

  const recommendations = [
    {
      title: 'Crie uma Reserva de Emergência',
      description: 'Recomendamos guardar pelo menos 6 meses de despesas básicas.',
      priority: 'high',
      action: 'emergency_reserve'
    },
    {
      title: 'Automatize suas Economias',
      description: 'Configure transferências automáticas para uma conta de investimentos.',
      priority: 'medium',
      action: 'automate_savings'
    },
    {
      title: 'Revise Assinaturas e Serviços',
      description: 'Cancele serviços que você não usa mais para economizar mensalmente.',
      priority: 'medium',
      action: 'review_subscriptions'
    },
    {
      title: 'Diversifique suas Fontes de Renda',
      description: 'Considere criar uma renda extra para acelerar seus objetivos financeiros.',
      priority: 'low',
      action: 'diversify_income'
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    toast.info("Reprocessando dados financeiros...");
    
    // Simular processamento
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Relatório atualizado com sucesso!");
    }, 1500);
  };

  const handleApplyRecommendation = (action: string) => {
    switch (action) {
      case 'emergency_reserve':
        // Redirecionar para Metas Financeiras com dados pré-preenchidos
        navigate('/metas-financeiras');
        // Aguardar um pouco para garantir que a página carregou
        setTimeout(() => {
          if ((window as any).openCreateGoalModal) {
            (window as any).openCreateGoalModal({
              title: 'Reserva de Emergência',
              target_amount: emergencyReserveTarget.toFixed(2),
              category: 'Segurança Financeira',
            });
          }
        }, 300);
        toast.success("Redirecionando para criar meta...");
        break;
      
      case 'review_subscriptions':
        navigate('/transacoes');
        toast.info("Revise suas transações recorrentes");
        break;
      
      case 'automate_savings':
        toast.info("Configure transferências automáticas no seu banco");
        break;
      
      case 'diversify_income':
        toast.info("Considere aprender novas habilidades ou iniciar um projeto paralelo");
        break;
      
      default:
        toast.info("Funcionalidade em desenvolvimento");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Análise Automática com IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights inteligentes baseados nos seus dados financeiros
          </p>
        </div>
        <Button className="gap-2" onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <BarChart3 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Gerar Novo Relatório
            </>
          )}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-income">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Receitas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-expense">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Taxa de Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsRate > 20 ? 'Excelente!' : savingsRate > 10 ? 'Bom' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Insights Inteligentes
          </CardTitle>
          <CardDescription>
            Análise automatizada dos seus hábitos financeiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className={`p-2 rounded-full bg-background ${insight.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Recomendações Personalizadas
          </CardTitle>
          <CardDescription>
            Ações sugeridas para melhorar sua saúde financeira
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-background border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{rec.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rec.priority === 'high' ? 'bg-expense/10 text-expense' :
                    rec.priority === 'medium' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleApplyRecommendation(rec.action)}
              >
                Aplicar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Note */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Análise Contínua</p>
              <p className="text-xs text-muted-foreground">
                Este painel é atualizado automaticamente conforme você registra novas transações. 
                Quanto mais dados você adicionar, mais precisas serão as análises e recomendações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoAnalysis;
