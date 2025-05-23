
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { 
  getTransactions, 
  getFilteredTransactions,
  addTransaction as addTransactionService,
  deleteTransaction as deleteTransactionService 
} from "@/services/transactionService";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";

/**
 * Hook for managing transactions data and operations
 */
export function useTransactions(filterDates: { startDate: Date; endDate: Date }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Query for all transactions
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: getTransactions,
    enabled: !!user,  // Garantir que consultas só aconteçam com usuário autenticado
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query for filtered transactions
  const { 
    data: filteredTransactions = [], 
    isLoading: isLoadingFilteredTransactions,
    refetch: refetchFilteredTransactions
  } = useQuery({
    queryKey: ['filteredTransactions', filterDates, user?.id],
    queryFn: () => getFilteredTransactions(
      format(filterDates.startDate, 'yyyy-MM-dd'),
      format(filterDates.endDate, 'yyyy-MM-dd')
    ),
    enabled: !!user,  // Garantir que consultas só aconteçam com usuário autenticado
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation for adding a transaction
  const addTransactionMutation = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, "id" | "created_at" | "user_id">) => 
      addTransactionService(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      
      toast({
        title: "Transação adicionada",
        description: "A transação foi salva com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransactionService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir transação",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    filteredTransactions,
    isLoadingTransactions,
    isLoadingFilteredTransactions,
    refetchTransactions,
    refetchFilteredTransactions,
    addTransaction: (transaction: Omit<Transaction, "id" | "created_at" | "user_id">) => 
      addTransactionMutation.mutateAsync(transaction),
    deleteTransaction: (id: string) => 
      deleteTransactionMutation.mutateAsync(id),
  };
}
