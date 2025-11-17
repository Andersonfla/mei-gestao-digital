import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";

const FinancialGoals = () => {
  // Mock data - futuramente será conectado ao backend
  const goals = [
    {
      id: 1,
      title: "Reserva de Emergência",
      target: 30000,
      current: 18500,
      category: "Segurança Financeira",
      deadline: "2025-12-31"
    },
    {
      id: 2,
      title: "Viagem Internacional",
      target: 15000,
      current: 8200,
      category: "Lazer",
      deadline: "2025-06-30"
    },
    {
      id: 3,
      title: "Compra de Equipamento",
      target: 5000,
      current: 4100,
      category: "Investimento",
      deadline: "2025-03-31"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Metas Financeiras
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Metas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{goals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Em progresso</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-income">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Economizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-income">
              {formatCurrency(goals.reduce((sum, g) => sum + g.current, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progresso Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">De conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {goal.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo encerrado'}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progresso</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% concluído</span>
                    <span>Faltam {formatCurrency(goal.target - goal.current)}</span>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Valor
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Comece definindo suas metas financeiras para acompanhar seu progresso
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialGoals;
