
import React, { createContext, useContext } from "react";
import { useFinanceData } from "./hooks";
import { FinanceContextType } from "./types";
import { 
  calculateBalance, 
  calculateTotalByType, 
  getCategoryBreakdown,
  calculateMonthlyReports
} from "./utils";
import { TransactionCategory, Transaction, UserPlan } from "@/types/finance";

// Create the context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    transactions,
    filteredTransactions,
    categories,
    userSettings,
    filterDates,
    filterPeriod,
    isLoading,
    addTransactionMutation,
    deleteTransactionMutation,
    upgradeToPremiumMutation,
    setFilterDates,
    setFilterPeriod
  } = useFinanceData();

  // Monthly reports
  const monthlyReports = calculateMonthlyReports(transactions);

  // Get category by ID
  const getCategoryById = (id: string): TransactionCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

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
        userSettings,
        monthlyReports,
        filterDates,
        filterPeriod,
        isLoading,
        addTransaction: handleAddTransaction,
        deleteTransaction: handleDeleteTransaction,
        getCategoryById,
        setFilterDates,
        setFilterPeriod,
        calculateBalance: () => calculateBalance(filteredTransactions),
        calculateTotalByType: (type) => calculateTotalByType(filteredTransactions, type),
        getCategoryBreakdown: (type) => getCategoryBreakdown(filteredTransactions, type),
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
