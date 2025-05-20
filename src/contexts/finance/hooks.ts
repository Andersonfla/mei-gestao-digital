
import { useState, useEffect } from "react";
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
import { Transaction, UserSettings, UserPlan } from "@/types/finance";

export function useFinanceData() {
  const [filterDates, setFilterDatesState] = useState(getDefaultFilterDates());
  const [filterPeriod, setFilterPeriodState] = useState("month");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Query de configurações do usuário
  console.log("useFinanceData - Usuário atual:", user?.id);

  const { 
    data: userSettings, 
    isLoading: isLoadingSettings,
    refetch: refetchUserSettings
  } = useQuery({
    queryKey: ['userSettings', user?.id], // Incluir o ID do usuário na chave
    queryFn: getUserSettings,
    enabled: !!user, // Garantir que só seja executado quando o usuário estiver autenticado
    staleTime: 1000 * 60, // 1 minuto, reduzimos para atualizar mais frequentemente
    refetchOnMount: true, // Sempre atualizar quando o componente monta
    refetchOnWindowFocus: true, // Atualizar quando o foco volta para a janela
    initialData: {
      plan: 'free' as UserPlan,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
    },
  });

  // Revalidar configurações de usuário periodicamente
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user?.id) {
        refetchUserSettings();
      }
    }, 30000); // Revalidar a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [refetchUserSettings, user?.id]);

  // Query de transações
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions', user?.id], // Adiciona o ID do usuário na chave
    queryFn: getTransactions,
    enabled: !!user, // Executa apenas se o usuário estiver carregado
    staleTime: 1000 * 60, // 1 minuto, reduzimos para atualizar mais frequentemente
    retry: (failureCount, error) => {
      // Não tenta novamente se o erro for relacionado à autenticação
      if (error instanceof Error && error.message.includes("autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query de transações filtradas
  const { 
    data: filteredTransactions = [], 
    isLoading: isLoadingFilteredTransactions,
    refetch: refetchFilteredTransactions
  } = useQuery({
    queryKey: ['filteredTransactions', filterDates, user?.id], // Incluir o usuário na chave
    queryFn: () => getFilteredTransactions(
      format(filterDates.startDate, 'yyyy-MM-dd'),
      format(filterDates.endDate, 'yyyy-MM-dd')
    ),
    enabled: !!user, // Garantir que só seja executado quando o usuário estiver autenticado
    staleTime: 1000 * 60, // 1 minuto, atualizações mais frequentes
    retry: (failureCount, error) => {
      // Não tenta novamente se o erro for relacionado à autenticação
      if (error instanceof Error && error.message.includes("autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query de categorias
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', user?.id], // Incluir o usuário na chave
    queryFn: getCategories,
    enabled: !!user, // Garantir que só seja executado quando o usuário estiver autenticado
    staleTime: 1000 * 60 * 5, // 5 minutos, categorias mudam menos frequentemente
  });

  // Mutação para adicionar transação
  const addTransactionMutation = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, "id" | "created_at" | "user_id">) => 
      addTransactionService(newTransaction),
    onSuccess: () => {
      // Invalidar todas as consultas relevantes para forçar uma atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      
      // Forçar uma refetch imediata para atualizar os contadores
      refetchUserSettings();
      refetchTransactions();
      refetchFilteredTransactions();
      
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

  // Mutação para excluir transação
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransactionService(id),
    onSuccess: () => {
      // Invalidar todas as consultas relevantes para forçar uma atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      
      // Forçar uma refetch imediata para atualizar os contadores
      refetchUserSettings();
      refetchTransactions();
      refetchFilteredTransactions();
      
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

  // Mutação para upgrade para premium
  const upgradeToPremiumMutation = useMutation({
    mutationFn: upgradeToPremiumService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      refetchUserSettings();
      
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

  // Estado de carregamento
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
    addTransaction: (transaction: Omit<Transaction, "id" | "created_at" | "user_id">) => 
      addTransactionMutation.mutateAsync(transaction),
    deleteTransaction: (id: string) => 
      deleteTransactionMutation.mutateAsync(id),
    upgradeToPremium: () => 
      upgradeToPremiumMutation.mutateAsync(),
    setFilterDates,
    setFilterPeriod,
    refetchUserSettings
  };
}
