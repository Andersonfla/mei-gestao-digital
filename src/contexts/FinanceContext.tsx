
import React, { createContext, useContext, useState, useEffect } from "react";
import { Transaction, TransactionCategory, UserSettings, TransactionType, MonthlyReport } from "@/types/finance";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  getFilteredTransactions 
} from "@/services/transactionService";
import { getCategories } from "@/services/categoryService";
import { getUserSettings, upgradeToPremium as upgradeToPremiumService } from "@/services/profileService";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  categories: TransactionCategory[];
  userSettings: UserSettings;
  monthlyReports: MonthlyReport[];
  filterDates: {
    startDate: Date;
    endDate: Date;
  };
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id" | "created_at">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getCategoryById: (id: string) => TransactionCategory | undefined;
  setFilterDates: (startDate: Date, endDate: Date) => void;
  upgradeToPremium: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date();
  
  // Default dates (current month)
  const defaultStartDate = startOfMonth(today);
  const defaultEndDate = endOfMonth(today);
  
  const [filterDates, setFilterDatesState] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  // Get transactions
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions 
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    enabled: !!user,
  });

  // Get filtered transactions
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

  // Get categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: !!user,
  });

  // Get user settings
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
      transactionLimit: 50,
    },
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: (newTransaction: Omit<Transaction, "id" | "created_at">) => addTransaction(newTransaction),
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
    mutationFn: (id: string) => deleteTransaction(id),
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

  // Calculate monthly reports
  const calculateMonthlyReports = (): MonthlyReport[] => {
    if (transactions.length === 0) return [];

    const reports: MonthlyReport[] = [];
    const now = new Date();

    // Create reports for the last 6 months
    for (let i = 0; i < 6; i++) {
      const reportDate = subMonths(now, i);
      const month = reportDate.getMonth() + 1;
      const year = reportDate.getFullYear();

      const monthStart = startOfMonth(reportDate);
      const monthEnd = endOfMonth(reportDate);

      const monthTransactions = transactions.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : parseISO(tx.date as string);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      const totalIncome = monthTransactions
        .filter(tx => tx.type === 'entrada')
        .reduce((sum, tx) => sum + tx.value, 0);

      const totalExpense = monthTransactions
        .filter(tx => tx.type === 'saida')
        .reduce((sum, tx) => sum + tx.value, 0);

      reports.push({
        month,
        year,
        totalIncome,
        totalExpense,
        profit: totalIncome - totalExpense,
        transactions: monthTransactions,
      });
    }

    return reports;
  };

  const monthlyReports = calculateMonthlyReports();

  const getCategoryById = (id: string): TransactionCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const isLoading = isLoadingTransactions || 
    isLoadingFilteredTransactions || 
    isLoadingCategories || 
    isLoadingSettings;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        userSettings: userSettings!,
        monthlyReports,
        filterDates,
        isLoading,
        addTransaction: addTransactionMutation.mutateAsync,
        deleteTransaction: deleteTransactionMutation.mutateAsync,
        getCategoryById,
        setFilterDates,
        upgradeToPremium: upgradeToPremiumMutation.mutateAsync,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
