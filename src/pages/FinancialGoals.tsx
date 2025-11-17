import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financialGoalsService, FinancialGoal } from "@/services/financialGoalsService";
import { Loader2 } from "lucide-react";

const FinancialGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAmountModalOpen, setIsAddAmountModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    category: "",
    end_date: "",
  });
  const [amountToAdd, setAmountToAdd] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const data = await financialGoalsService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      await financialGoalsService.createGoal({
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        category: formData.category || undefined,
        end_date: formData.end_date || undefined,
      });
      setIsCreateModalOpen(false);
      setFormData({ title: "", target_amount: "", category: "", end_date: "" });
      loadGoals();
    } catch (error) {
      console.error("Erro ao criar meta:", error);
    }
  };

  const handleEditGoal = async () => {
    if (!selectedGoal) return;
    try {
      await financialGoalsService.updateGoal(selectedGoal.id, {
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        category: formData.category || undefined,
        end_date: formData.end_date || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedGoal(null);
      setFormData({ title: "", target_amount: "", category: "", end_date: "" });
      loadGoals();
    } catch (error) {
      console.error("Erro ao editar meta:", error);
    }
  };

  const handleAddAmount = async () => {
    if (!selectedGoal || !amountToAdd) return;
    try {
      await financialGoalsService.addAmount(selectedGoal.id, parseFloat(amountToAdd));
      setIsAddAmountModalOpen(false);
      setSelectedGoal(null);
      setAmountToAdd("");
      loadGoals();
    } catch (error) {
      console.error("Erro ao adicionar valor:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    try {
      await financialGoalsService.deleteGoal(goalId);
      loadGoals();
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
    }
  };

  const openEditModal = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      category: goal.category || "",
      end_date: goal.end_date || "",
    });
    setIsEditModalOpen(true);
  };

  const openAddAmountModal = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setIsAddAmountModalOpen(true);
  };

  const openCreateModal = (prefill?: Partial<typeof formData>) => {
    if (prefill) {
      setFormData({ ...formData, ...prefill });
    }
    setIsCreateModalOpen(true);
  };

  // Expor função globalmente para ser chamada de outras páginas
  useEffect(() => {
    (window as any).openCreateGoalModal = openCreateModal;
    return () => {
      delete (window as any).openCreateGoalModal;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <Button className="gap-2" onClick={() => openCreateModal()}>
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
              {formatCurrency(goals.reduce((sum, g) => sum + g.current_amount, 0))}
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
              {(goals.reduce((sum, g) => sum + (g.current_amount / g.target_amount) * 100, 0) / goals.length).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">De conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const daysLeft = goal.end_date ? Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
          
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
                        {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo encerrado') : 'Sem prazo definido'}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(goal)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progresso</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% concluído</span>
                    <span>Faltam {formatCurrency(goal.target_amount - goal.current_amount)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full gap-2"
                  onClick={() => openAddAmountModal(goal)}
                >
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
            <Button className="gap-2" onClick={() => openCreateModal()}>
              <Plus className="w-4 h-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criar Meta */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta Financeira</DialogTitle>
            <DialogDescription>
              Defina uma nova meta financeira para acompanhar seu progresso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Nome da Meta</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Reserva de Emergência"
              />
            </div>
            <div>
              <Label htmlFor="target_amount">Valor Total da Meta</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Segurança Financeira"
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Alvo (opcional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateGoal}>Criar Meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Meta */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da sua meta financeira
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_title">Nome da Meta</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_target_amount">Valor Total da Meta</Label>
              <Input
                id="edit_target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_category">Categoria</Label>
              <Input
                id="edit_category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_end_date">Data Alvo</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditGoal}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Valor */}
      <Dialog open={isAddAmountModalOpen} onOpenChange={setIsAddAmountModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Valor à Meta</DialogTitle>
            <DialogDescription>
              Quanto você quer adicionar à meta "{selectedGoal?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAmountModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddAmount}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialGoals;
