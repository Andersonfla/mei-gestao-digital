
import React, { createContext, useContext, useState, useEffect } from "react";
import { Transaction, TransactionCategory, UserSettings, TransactionType, MonthlyReport, CategoryBreakdownItem, UserPlan } from "@/types/finance";
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
  filterPeriod: string;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id" | "created_at">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getCategoryById: (id: string) => TransactionCategory | undefined;
  setFilterDates: (startDate: Date, endDate: Date) => void;
  setFilterPeriod: (period: string) => void;
  calculateBalance: () => number;
  calculateTotalByType: (type: 'entrada' | 'saida') => number;
  getCategoryBreakdown: (type: 'entrada' | 'saida') => CategoryBreakdownItem[];
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

  const [filterPeriod, setFilterPeriodState] = useState("month");

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
      plan: 'free' as UserPlan,
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

  const setFilterPeriod = (period: string) => {
    setFilterPeriodState(period);
    
    // Update the filter dates based on selected period
    if (period === "week") {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      setFilterDatesState({
        startDate: weekStart,
        endDate: today,
      });
    } else if (period === "month") {
      setFilterDatesState({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
    } else if (period === "all") {
      // Set to a far past date and today for "all" filter
      const farPast = new Date();
      farPast.setFullYear(farPast.getFullYear() - 5);
      setFilterDatesState({
        startDate: farPast,
        endDate: today,
      });
    }
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

  const calculateBalance = (): number => {
    return filteredTransactions.reduce((balance, tx) => {
      if (tx.type === 'entrada') {
        return balance + tx.value;
      } else {
        return balance - tx.value;
      }
    }, 0);
  };

  const calculateTotalByType = (type: 'entrada' | 'saida'): number => {
    return filteredTransactions
      .filter(tx => tx.type === type)
      .reduce((total, tx) => total + tx.value, 0);
  };

  const getCategoryBreakdown = (type: 'entrada' | 'saida'): CategoryBreakdownItem[] => {
    const typeTransactions = filteredTransactions.filter(tx => tx.type === type);
    if (typeTransactions.length === 0) return [];

    const totalValue = typeTransactions.reduce((sum, tx) => sum + tx.value, 0);
    const categorySums: Record<string, number> = {};
    
    // Sum by category
    typeTransactions.forEach(tx => {
      if (!categorySums[tx.category]) {
        categorySums[tx.category] = 0;
      }
      categorySums[tx.category] += tx.value;
    });
    
    // Convert to array and calculate percentages
    return Object.entries(categorySums).map(([name, value]) => ({
      name,
      value,
      percent: value / totalValue
    }));
  };

  const monthlyReports = calculateMonthlyReports();

  const getCategoryById = (id: string): TransactionCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const isLoading = isLoadingTransactions || 
    isLoadingFilteredTransactions || 
    isLoadingCategories || 
    isLoadingSettings;

  // Handle async mutations properly
  const handleAddTransaction = async (transaction: Omit<Transaction, "id" | "created_at">) => {
    await addTransactionMutation.mutateAsync(transaction);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransactionMutation.mutateAsync(id);
  };

  const handleUpgradeToPremium = async () => {
    await upgradeToPremiumMutation.mutateAsync();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        userSettings: userSettings!,
        monthlyReports,
        filterDates,
        filterPeriod,
        isLoading,
        addTransaction: handleAddTransaction,
        deleteTransaction: handleDeleteTransaction,
        getCategoryById,
        setFilterDates,
        setFilterPeriod,
        calculateBalance,
        calculateTotalByType,
        getCategoryBreakdown,
        upgradeToPremium: handleUpgradeToPremium,
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
