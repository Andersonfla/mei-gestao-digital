
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function TransactionsTable() {
  const { filteredTransactions, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Limit to latest 5 transactions
  const latestTransactions = [...filteredTransactions]
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : parseISO(a.date as string);
      const dateB = b.date instanceof Date ? b.date : parseISO(b.date as string);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await deleteTransaction(id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, 'dd/MM/yyyy');
    }
    return format(parseISO(date), 'dd/MM/yyyy');
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
            return (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description || '-'}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'entrada' ? 'text-income' : 'text-expense'
                }`}>
                  {transaction.type === 'entrada' ? '+' : '-'}
                  {formatCurrency(transaction.value)}
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
