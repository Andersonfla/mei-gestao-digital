import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { getAllUsers, updateUserPlan, updateUserStatus, deleteUserProfile, AdminUser } from "@/services/adminUsersService";
import { Crown, Trash2, RefreshCw, Search, Edit, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'pro'>('free');
  const [selectedDuration, setSelectedDuration] = useState<string>('12');
  const [customDuration, setCustomDuration] = useState<string>('');
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setFilteredUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const openEditDialog = (user: AdminUser) => {
    setEditDialog({ open: true, user });
    setSelectedPlan((user.plan as 'free' | 'premium' | 'pro') || 'free');
    setSelectedDuration('12');
    setCustomDuration('');
  };

  const handleUpdatePlan = async () => {
    if (!editDialog.user) return;

    const duration = selectedDuration === 'custom' 
      ? parseInt(customDuration) 
      : parseInt(selectedDuration);

    if (isNaN(duration) || duration <= 0) {
      toast({
        title: "Erro",
        description: "Duração inválida",
        variant: "destructive",
      });
      return;
    }

    const success = await updateUserPlan(
      editDialog.user.id,
      selectedPlan,
      editDialog.user.email || undefined,
      duration
    );

    if (success) {
      toast({
        title: "Plano atualizado",
        description: `Plano de ${editDialog.user.email} alterado para ${selectedPlan} (${duration} meses)`,
      });
      fetchUsers();
      setEditDialog({ open: false, user: null });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const success = await updateUserStatus(user.id, newStatus, user.email || undefined);

    if (success) {
      toast({
        title: "Status atualizado",
        description: `Usuário ${user.email} ${newStatus === 'suspended' ? 'suspenso' : 'ativado'}`,
      });
      fetchUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    const success = await deleteUserProfile(deleteDialog.user.id, deleteDialog.user.email || undefined);

    if (success) {
      toast({
        title: "Usuário excluído",
        description: `${deleteDialog.user.email} foi removido do sistema`,
      });
      fetchUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }

    setDeleteDialog({ open: false, user: null });
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'premium':
        return (
          <Badge variant="default">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        );
      case 'pro':
        return (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        );
      default:
        return <Badge variant="secondary">Gratuito</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === 'suspended' ? (
      <Badge variant="destructive">Suspenso</Badge>
    ) : (
      <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma</CardDescription>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por e-mail ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando usuários...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Lançamentos</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email || "N/A"}</TableCell>
                        <TableCell>{user.name || "-"}</TableCell>
                        <TableCell>{getPlanBadge(user.plan)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          {user.used_transactions}/{user.plan === 'premium' || user.plan === 'pro' ? '∞' : '20'}
                        </TableCell>
                        <TableCell>
                          {user.subscription_end
                            ? format(new Date(user.subscription_end), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => openEditDialog(user)}
                              variant="outline"
                              size="sm"
                              title="Editar Plano"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleStatus(user)}
                              variant={user.status === 'suspended' ? 'default' : 'outline'}
                              size="sm"
                              title={user.status === 'suspended' ? 'Ativar' : 'Suspender'}
                            >
                              {user.status === 'suspended' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => setDeleteDialog({ open: true, user })}
                              variant="destructive"
                              size="sm"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Total: {filteredUsers.length} usuário(s)
          </div>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano do Usuário</DialogTitle>
            <DialogDescription>
              Atualize o plano e a duração para {editDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Plano</Label>
              <Select value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPlan !== 'free' && (
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 mês</SelectItem>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">1 ano (12 meses)</SelectItem>
                    <SelectItem value="24">2 anos (24 meses)</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedDuration === 'custom' && selectedPlan !== 'free' && (
              <div className="space-y-2">
                <Label>Número de Meses</Label>
                <Input
                  type="number"
                  placeholder="Digite o número de meses"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  min="1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, user: null })}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePlan}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deleteDialog.user?.email}</strong>?
              Esta ação não pode ser desfeita e todos os dados do usuário serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
