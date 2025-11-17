import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Plus, Trash2, Check } from "lucide-react";
import { getAllWallets, createWallet, updateWallet, deleteWallet, setDefaultWallet } from "@/services/walletService";

const WALLET_ICONS = ['Wallet', 'CreditCard', 'Banknote', 'DollarSign', 'PiggyBank'];
const WALLET_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const WalletManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    icon: 'Wallet',
    color: '#2563EB'
  });

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: getAllWallets
  });

  const createMutation = useMutation({
    mutationFn: () => createWallet(newWallet.name, newWallet.icon, newWallet.color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "✅ Carteira criada",
        description: "Sua nova carteira foi adicionada com sucesso.",
      });
      setIsOpen(false);
      setNewWallet({ name: '', icon: 'Wallet', color: '#2563EB' });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar a carteira.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "✅ Carteira excluída",
        description: "A carteira foi removida com sucesso.",
      });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "✅ Carteira padrão definida",
      });
    }
  });

  if (isLoading) {
    return <Card><CardContent className="p-6">Carregando...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Carteiras</h2>
          <p className="text-muted-foreground">Gerencie suas carteiras e organize suas finanças</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Carteira
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Carteira</DialogTitle>
              <DialogDescription>
                Adicione uma nova carteira para organizar melhor suas finanças
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Carteira</Label>
                <Input
                  id="name"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  placeholder="Ex: Pessoal, Empresa, Investimentos..."
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <div className="flex gap-2 mt-2">
                  {WALLET_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={newWallet.icon === icon ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewWallet({ ...newWallet, icon })}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cor</Label>
                <div className="flex gap-2 mt-2">
                  {WALLET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setNewWallet({ ...newWallet, color })}
                    >
                      {newWallet.color === color && <Check className="w-4 h-4 text-white m-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newWallet.name || createMutation.isPending}
                className="w-full"
              >
                Criar Carteira
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: wallet.color }}
                  >
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{wallet.name}</CardTitle>
                </div>
                {wallet.is_default && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Padrão
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {!wallet.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(wallet.id)}
                    disabled={setDefaultMutation.isPending}
                  >
                    Definir como Padrão
                  </Button>
                )}
                {!wallet.is_default && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(wallet.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
