
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import { useState } from "react";

const Transactions = () => {
  const { filteredTransactions, deleteTransaction } = useFinance();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Apply type filter
  const displayedTransactions = typeFilter === "all"
    ? filteredTransactions
    : filteredTransactions.filter(tx => tx.type === typeFilter);
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...displayedTransactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : parseISO(a.date as string);
    const dateB = b.date instanceof Date ? b.date : parseISO(b.date as string);
    return dateB.getTime() - dateA.getTime();
  });
  
  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, 'dd/MM/yyyy');
    }
    return format(parseISO(date), 'dd/MM/yyyy');
  };
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await deleteTransaction(id);
    setIsDeleting(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Transações</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tipo:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Receitas</SelectItem>
                <SelectItem value="saida">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <FilterPeriod />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
            {sortedTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                <p className="text-sm text-muted-foreground mt-1">Use o formulário ao lado para adicionar uma nova</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => {
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description || '-'}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'entrada'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'entrada' ? 'text-income' : 'text-expense'
                        }`}>
                          {transaction.type === 'entrada' ? '+' : '-'}
                          {formatCurrency(transaction.value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={isDeleting === transaction.id}
                          >
                            {isDeleting === transaction.id ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        <div>
          <TransactionForm />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
