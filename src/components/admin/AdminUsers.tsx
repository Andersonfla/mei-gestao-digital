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
import { promoteToAdmin, revokeAdmin, checkUserIsAdmin } from "@/services/adminRolesService";
import { Edit, Trash2, RefreshCw, Search, Ban, CheckCircle, AlertCircle, Shield, Crown, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userAdminStatus, setUserAdminStatus] = useState<Record<string, boolean>>({});
  
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'master'>('free');
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
    
    // Check admin status for each user
    const adminStatusMap: Record<string, boolean> = {};
    for (const user of data) {
      const isAdmin = await checkUserIsAdmin(user.id);
      adminStatusMap[user.id] = isAdmin;
    }
    setUserAdminStatus(adminStatusMap);
    
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
    setSelectedPlan((user.plan as 'free' | 'premium' | 'master') || 'free');
    setSelectedDuration('12');
    setCustomDuration('');
  };

  const handleUpdatePlan = async () => {
    if (!editDialog.user) return;

    const duration = selectedDuration === 'custom' 
      ? parseInt(customDuration) 
      : parseInt(selectedDuration);

    if (selectedPlan !== 'free' && (isNaN(duration) || duration <= 0)) {
      toast({
        title: "Erro",
        description: "Duração inválida. Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    const success = await updateUserPlan(
      editDialog.user.id,
      selectedPlan,
      editDialog.user.email || undefined,
      selectedPlan === 'free' ? undefined : duration
    );

    if (success) {
      const planName = selectedPlan === 'premium' ? 'Premium Pro' 
        : selectedPlan === 'master' ? 'Premium Master' 
        : 'Gratuito';
      const durationText = selectedPlan === 'free' 
        ? '' 
        : ` por ${duration} ${duration === 1 ? 'mês' : 'meses'}`;
      
      toast({
        title: "✅ Plano atualizado com sucesso",
        description: `${editDialog.user.email} agora tem plano ${planName}${durationText}`,
      });
      fetchUsers();
      setEditDialog({ open: false, user: null });
    } else {
      toast({
        title: "Erro ao atualizar plano",
        description: "Não foi possível atualizar o plano. Verifique suas permissões.",
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

  const handleToggleAdmin = async (user: AdminUser) => {
    const isCurrentlyAdmin = userAdminStatus[user.id];
    
    const success = isCurrentlyAdmin
      ? await revokeAdmin(user.id, user.email || undefined)
      : await promoteToAdmin(user.id, user.email || undefined);

    if (success) {
      toast({
        title: isCurrentlyAdmin ? "Admin removido" : "Admin promovido",
        description: isCurrentlyAdmin
          ? `${user.email} agora é um usuário comum.`
          : `${user.email} agora é administrador.`,
      });
      fetchUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de administrador.",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'premium':
        return (
          <Badge variant="default" className="text-[10px] sm:text-xs whitespace-nowrap">
            <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">Premium Pro</span>
            <span className="sm:hidden">Pro</span>
          </Badge>
        );
      case 'master':
        return (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] sm:text-xs whitespace-nowrap">
            <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">Premium Master</span>
            <span className="sm:hidden">Master</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[10px] sm:text-xs">Gratuito</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === 'suspended' ? (
      <Badge variant="destructive" className="text-[10px] sm:text-xs">Suspenso</Badge>
    ) : (
      <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] sm:text-xs">Ativo</Badge>
    );
  };

  return (
    <>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl">Gestão de Usuários</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Gerencie planos, status e contas de todos os usuários
              </CardDescription>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          {/* Info box - collapsible on mobile */}
          <details className="rounded-lg border bg-muted/50 overflow-hidden">
            <summary className="p-3 sm:p-4 cursor-pointer text-sm font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Poderes de Administrador
            </summary>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 px-3 sm:px-4 pb-3 sm:pb-4 ml-6 list-disc">
              <li>Atribuir ou alterar plano de qualquer usuário</li>
              <li>Definir duração personalizada do plano (1 mês até 10 anos)</li>
              <li>Suspender ou reativar contas temporariamente</li>
              <li>Excluir usuários permanentemente</li>
            </ul>
          </details>

          <div className="flex items-center gap-2 w-full">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Buscar por e-mail ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando usuários...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">E-mail</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Nome</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Função</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Plano</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap text-right hidden lg:table-cell">Lanç.</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Vencimento</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap text-right">Ações</TableHead>
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
                        <TableCell className="font-medium text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{user.name || "-"}</TableCell>
                        <TableCell>
                          {userAdminStatus[user.id] ? (
                            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 text-[10px] sm:text-xs">
                              <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">Admin</span>
                              <span className="sm:hidden">Adm</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              <span className="hidden sm:inline">Usuário</span>
                              <span className="sm:hidden">User</span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getPlanBadge(user.plan)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm hidden lg:table-cell">
                          {user.used_transactions}/{user.plan === 'premium' || user.plan === 'pro' ? '∞' : '20'}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          {user.subscription_end
                            ? format(new Date(user.subscription_end), "dd/MM/yy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant={userAdminStatus[user.id] ? "destructive" : "default"}
                              onClick={() => handleToggleAdmin(user)}
                              title={userAdminStatus[user.id] ? "Remover Admin" : "Promover a Admin"}
                              className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${userAdminStatus[user.id] ? "" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"}`}
                            >
                              {userAdminStatus[user.id] ? (
                                <ShieldOff className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => openEditDialog(user)}
                              variant="outline"
                              size="sm"
                              title="Editar Plano"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleStatus(user)}
                              variant={user.status === 'suspended' ? 'default' : 'outline'}
                              size="sm"
                              title={user.status === 'suspended' ? 'Ativar' : 'Suspender'}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              {user.status === 'suspended' ? (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => setDeleteDialog({ open: true, user })}
                              variant="destructive"
                              size="sm"
                              title="Excluir Usuário"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

          <div className="text-xs sm:text-sm text-muted-foreground">
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
                  <SelectItem value="free">🆓 Plano Gratuito</SelectItem>
                  <SelectItem value="premium">👑 Plano Premium</SelectItem>
                  <SelectItem value="master">🔥 Plano Premium Master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPlan !== 'free' && (
              <>
                <div className="space-y-2">
                  <Label>Duração do Plano</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mês</SelectItem>
                      <SelectItem value="3">3 meses (trimestral)</SelectItem>
                      <SelectItem value="6">6 meses (semestral)</SelectItem>
                      <SelectItem value="12">1 ano (anual) - Padrão</SelectItem>
                      <SelectItem value="24">2 anos (bienal)</SelectItem>
                      <SelectItem value="36">3 anos</SelectItem>
                      <SelectItem value="custom">Duração personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedDuration === 'custom' && (
                  <div className="space-y-2">
                    <Label>Número de Meses (personalizado)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 18 para 1 ano e meio"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      min="1"
                      max="120"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo: 120 meses (10 anos)
                    </p>
                  </div>
                )}

                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-sm font-medium">Resumo:</p>
                  <p className="text-sm text-muted-foreground">
                    Plano <strong>
                      {selectedPlan === 'premium' ? 'Premium Pro' 
                        : selectedPlan === 'master' ? 'Premium Master'
                        : 'Gratuito'}
                    </strong> será ativo por{' '}
                    <strong>
                      {selectedDuration === 'custom' 
                        ? `${customDuration || '?'} meses` 
                        : `${selectedDuration} ${parseInt(selectedDuration) === 1 ? 'mês' : 'meses'}`}
                    </strong>
                  </p>
                </div>
              </>
            )}

            {selectedPlan === 'free' && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Ao definir como Gratuito, o usuário perderá acesso aos recursos premium e a data de expiração será removida.
                </p>
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
              Tem certeza que deseja excluir permanentemente o usuário <strong>{deleteDialog.user?.email}</strong>?
              <br /><br />
              <strong>Esta ação irá:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remover todos os dados do usuário (transações, categorias, metas, etc.)</li>
                <li>Excluir a conta de autenticação (o usuário não poderá mais fazer login)</li>
                <li>Esta ação não pode ser desfeita</li>
              </ul>
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
