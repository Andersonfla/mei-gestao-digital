
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { getDefaultFilterDates, updateFilterDatesForPeriod } from "./utils";
import { 
  getTransactions, 
  getFilteredTransactions, 
  addTransaction as addTransactionService,
  deleteTransaction as deleteTransactionService
} from "@/services/transactionService";
import { getCategories } from "@/services/categoryService";
import { getUserSettings, upgradeToPremium as upgradeToPremiumService } from "@/services/profileService";
import { format } from "date-fns";

export function useFinanceData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter state
  const [filterDates, setFilterDatesState] = useState(getDefaultFilterDates());
  const [filterPeriod, setFilterPeriodState] = useState("month");

  // Transactions query
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions 
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    enabled: !!user,
  });

  // Filtered transactions query
  const { 
    data: filteredTransactions = [], 
    isLoading: isLoadingFilteredTransactions 
  } = useQuery({
    queryKey: ['filteredTransactions', filterDates],
    queryFn: () => getFilteredTransactions(
      format(filterDates.startDate, 'yyyy-MM-dd'),
      format(filterDates.endDate, 'yyyy-MM-dd')
    ),
    enabled: !!user,
  });

  // Categories query
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: !!user,
  });

  // User settings query
  const { 
    data: userSettings, 
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: ['userSettings'],
    queryFn: getUserSettings,
    enabled: !!user,
    initialData: {
      plan: 'free',
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
    },
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, "id" | "created_at">) => 
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

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransactionService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTransactions'] });
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

  // Upgrade to premium mutation
  const upgradeToPremiumMutation = useMutation({
    mutationFn: upgradeToPremiumService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast({
        title: "Plano atualizado",
        description: "Seu plano foi atualizado para Premium com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o plano",
        variant: "destructive",
      });
    },
  });

  const setFilterDates = (startDate: Date, endDate: Date) => {
    setFilterDatesState({ startDate, endDate });
  };

  const setFilterPeriod = (period: string) => {
    setFilterPeriodState(period);
    setFilterDatesState(updateFilterDatesForPeriod(period));
  };

  // Loading state
  const isLoading = isLoadingTransactions || 
    isLoadingFilteredTransactions || 
    isLoadingCategories || 
    isLoadingSettings;

  return {
    transactions,
    filteredTransactions,
    categories,
    userSettings: userSettings!,
    filterDates,
    filterPeriod,
    isLoading,
    addTransactionMutation,
    deleteTransactionMutation,
    upgradeToPremiumMutation,
    setFilterDates,
    setFilterPeriod
  };
}
