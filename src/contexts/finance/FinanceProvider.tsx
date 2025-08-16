
import React, { createContext, useContext } from "react";
import { useFinanceData } from "./hooks";
import { FinanceContextType } from "./types";
import { 
  calculateBalance, 
  calculateTotalByType, 
  getCategoryBreakdown,
  calculateMonthlyReports
} from "./utils";
import { TransactionCategory, Transaction } from "@/types/finance";

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
    addTransaction: addTransactionHook,
    deleteTransaction,
    upgradeToPremium,
    isPremiumActive,
    setFilterDates,
    setFilterPeriod,
    refetchUserSettings,
    isPremiumCategory
  } = useFinanceData();

  // Monthly reports
  const monthlyReports = calculateMonthlyReports(transactions);

  // Get category by ID
  const getCategoryById = (id: string): TransactionCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };
  
  // Wrapper function to match the expected type in FinanceContextType
  const addTransaction = async (transaction: Omit<Transaction, "id" | "created_at">): Promise<void> => {
    await addTransactionHook(transaction);
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
        isPremiumActive: isPremiumActive(), // Call the function to get the boolean value
        isPremiumCategory,
        addTransaction,
        deleteTransaction,
        getCategoryById,
        setFilterDates,
        setFilterPeriod,
        calculateBalance: () => calculateBalance(filteredTransactions),
        calculateTotalByType: (type) => calculateTotalByType(filteredTransactions, type),
        getCategoryBreakdown: (type) => getCategoryBreakdown(filteredTransactions, type),
        upgradeToPremium,
        refetchUserSettings,
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
