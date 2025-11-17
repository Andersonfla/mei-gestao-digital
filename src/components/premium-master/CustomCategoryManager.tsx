import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tag, Plus, Trash2 } from "lucide-react";
import { getAllCustomCategories, createCustomCategory, deleteCustomCategory } from "@/services/customCategoryService";
import { TransactionType } from "@/types/finance";

const CATEGORY_ICONS = ['Tag', 'Star', 'Heart', 'Flag', 'Target'];
const CATEGORY_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const CustomCategoryManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'entrada' as TransactionType,
    icon: 'Tag',
    color: '#2563EB'
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['custom-categories'],
    queryFn: getAllCustomCategories
  });

  const createMutation = useMutation({
    mutationFn: () => createCustomCategory(
      newCategory.name,
      newCategory.type,
      newCategory.icon,
      newCategory.color
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-categories'] });
      toast({
        title: "✅ Categoria criada",
        description: "Sua nova categoria foi adicionada com sucesso.",
      });
      setIsOpen(false);
      setNewCategory({ name: '', type: 'entrada', icon: 'Tag', color: '#2563EB' });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-categories'] });
      toast({
        title: "✅ Categoria excluída",
        description: "A categoria foi removida com sucesso.",
      });
    }
  });

  if (isLoading) {
    return <Card><CardContent className="p-6">Carregando...</CardContent></Card>;
  }

  const incomeCategories = categories.filter(c => c.type === 'entrada');
  const expenseCategories = categories.filter(c => c.type === 'saida');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorias Personalizadas</h2>
          <p className="text-muted-foreground">Crie suas próprias categorias para organizar transações</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma categoria personalizada para suas transações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ex: Freelance, Fornecedores..."
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newCategory.type}
                  onValueChange={(value: TransactionType) => setNewCategory({ ...newCategory, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Receita</SelectItem>
                    <SelectItem value="saida">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ícone</Label>
                <div className="flex gap-2 mt-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={newCategory.icon === icon ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cor</Label>
                <div className="flex gap-2 mt-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 border-border"
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newCategory.name || createMutation.isPending}
                className="w-full"
              >
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
            <CardDescription>{incomeCategories.length} categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria de receita personalizada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <CardDescription>{expenseCategories.length} categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria de despesa personalizada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
