import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Edit, Trash2, Pause, Play, Calendar, Upload } from "lucide-react";
import { CSVImportDialog } from "@/components/recurring/CSVImportDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { recurringTransactionService, RecurringTransaction, frequencyLabels } from "@/services/recurringTransactionService";
import { useFinance } from "@/contexts";
import { Loader2 } from "lucide-react";

const RecurringTransactions = () => {
  const { categories } = useFinance();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    type: "saida" as "entrada" | "saida",
    category: "",
    value: "",
    frequency: "mensal" as any,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await recurringTransactionService.getRecurringTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await recurringTransactionService.createRecurringTransaction({
        description: formData.description,
        type: formData.type,
        category: formData.category,
        value: parseFloat(formData.value),
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
      });
      setIsModalOpen(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error("Erro ao criar:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedTransaction) return;
    try {
      await recurringTransactionService.updateRecurringTransaction(selectedTransaction.id, {
        description: formData.description,
        type: formData.type,
        category: formData.category,
        value: parseFloat(formData.value),
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedTransaction(null);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error("Erro ao editar:", error);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await recurringTransactionService.toggleActive(id, !currentActive);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação recorrente?")) return;
    try {
      await recurringTransactionService.deleteRecurringTransaction(id);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      description: transaction.description || "",
      type: transaction.type as "entrada" | "saida",
      category: transaction.category,
      value: transaction.value.toString(),
      frequency: transaction.frequency as any,
      start_date: transaction.start_date,
      end_date: transaction.end_date || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      description: "",
      type: "saida",
      category: "",
      value: "",
      frequency: "mensal",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    });
  };

  const getCategoryOptions = () => {
    return categories.filter(cat => cat.type === formData.type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTransactions = transactions.filter(t => t.active);
  const pausedTransactions = transactions.filter(t => !t.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary" />
            Transações Recorrentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure transações que se repetem automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Nova Transação Recorrente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-income">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-income">{activeTransactions.length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-expense">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pausadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-expense">{pausedTransactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Transactions */}
      {activeTransactions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Transações Ativas</h2>
          {activeTransactions.map((transaction) => (
            <Card key={transaction.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{transaction.description || "Sem descrição"}</CardTitle>
                      <Badge variant={transaction.type === 'entrada' ? 'default' : 'destructive'}>
                        {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <Badge variant="outline">{frequencyLabels[transaction.frequency]}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span>{transaction.category}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Próxima: {new Date(transaction.next_date).toLocaleDateString('pt-BR')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${transaction.type === 'entrada' ? 'text-income' : 'text-expense'}`}>
                      {formatCurrency(transaction.value)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(transaction)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleActive(transaction.id, transaction.active)}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paused Transactions */}
      {pausedTransactions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Transações Pausadas</h2>
          {pausedTransactions.map((transaction) => (
            <Card key={transaction.id} className="shadow-md opacity-60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{transaction.description || "Sem descrição"}</CardTitle>
                      <Badge variant="secondary">Pausada</Badge>
                    </div>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(transaction.value)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleActive(transaction.id, transaction.active)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma transação recorrente</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Configure transações que se repetem automaticamente todo mês, semana ou outro período
            </p>
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Criar Primeira Transação Recorrente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Transação Recorrente" : "Nova Transação Recorrente"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Modifique os detalhes da transação" : "Configure uma transação que se repete automaticamente"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Aluguel, Salário, Netflix..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value, category: "" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions().map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data de Término (opcional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={isEditMode ? handleEdit : handleCreate}>
              {isEditMode ? "Salvar Alterações" : "Criar Transação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={loadTransactions}
      />
    </div>
  );
};

export default RecurringTransactions;
