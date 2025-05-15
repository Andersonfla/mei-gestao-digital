
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function TransactionsTable() {
  const { filteredTransactions, deleteTransaction, getCategoryById } = useFinance();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Limit to latest 5 transactions
  const latestTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteTransaction(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (latestTransactions.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latestTransactions.map((transaction) => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{category?.name || 'Sem categoria'}</TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting === transaction.id}
                    onClick={() => handleDelete(transaction.id)}
                  >
                    {isDeleting === transaction.id ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
