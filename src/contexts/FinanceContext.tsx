
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Transaction, TransactionCategory, TransactionType, UserSettings } from '@/types/finance';

// Demo data for transactions
const demoTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date(2025, 4, 10),
    amount: 2500,
    description: 'Venda de produtos',
    type: 'income',
    categoryId: 'sales',
  },
  {
    id: '2',
    date: new Date(2025, 4, 12),
    amount: 350.5,
    description: 'Material de escritório',
    type: 'expense',
    categoryId: 'supplies',
  },
  {
    id: '3',
    date: new Date(2025, 4, 15),
    amount: 1800,
    description: 'Consultoria',
    type: 'income',
    categoryId: 'services',
  },
  {
    id: '4',
    date: new Date(2025, 4, 18),
    amount: 89.9,
    description: 'Internet',
    type: 'expense',
    categoryId: 'utilities',
  },
  {
    id: '5',
    date: new Date(2025, 4, 20),
    amount: 1200,
    description: 'Venda de produto',
    type: 'income',
    categoryId: 'sales',
  }
];

// Demo data for categories
const demoCategories: TransactionCategory[] = [
  { id: 'sales', name: 'Vendas', type: 'income' },
  { id: 'services', name: 'Serviços', type: 'income' },
  { id: 'others_income', name: 'Outros', type: 'income' },
  { id: 'supplies', name: 'Materiais', type: 'expense' },
  { id: 'utilities', name: 'Serviços Públicos', type: 'expense' },
  { id: 'rent', name: 'Aluguel', type: 'expense' },
  { id: 'taxes', name: 'Impostos', type: 'expense' },
  { id: 'others_expense', name: 'Outros', type: 'expense' },
];

// Initial user settings
const initialUserSettings: UserSettings = {
  plan: 'free',
  darkMode: false,
  transactionCountThisMonth: demoTransactions.length,
  transactionLimit: 50, // Free limit
};

// Context type definition
interface FinanceContextType {
  transactions: Transaction[];
  categories: TransactionCategory[];
  userSettings: UserSettings;
  filteredTransactions: Transaction[];
  filterPeriod: 'all' | 'month' | 'week';
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getCategoryById: (id: string) => TransactionCategory | undefined;
  calculateBalance: () => number;
  calculateTotalByType: (type: TransactionType, periodFilter?: 'all' | 'month' | 'week') => number;
  setFilterPeriod: (period: 'all' | 'month' | 'week') => void;
  getCategoryBreakdown: (type: TransactionType) => Array<{ name: string, value: number }>;
  upgradeToPremium: () => void;
}

// Create context
export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [categories] = useState<TransactionCategory[]>(demoCategories);
  const [userSettings, setUserSettings] = useState<UserSettings>(initialUserSettings);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'week'>('month');
  
  // Filter transactions based on period
  const filteredTransactions = transactions.filter(transaction => {
    const now = new Date();
    const txDate = new Date(transaction.date);
    
    if (filterPeriod === 'all') {
      return true;
    } else if (filterPeriod === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return txDate >= oneWeekAgo;
    }
    
    return true;
  });

  // Add new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    // Check for transaction limit on free plan
    if (userSettings.plan === 'free' && 
        userSettings.transactionCountThisMonth >= userSettings.transactionLimit) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de lançamentos no plano gratuito.",
        variant: "destructive"
      });
      return;
    }
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update transaction count
    setUserSettings(prev => ({
      ...prev,
      transactionCountThisMonth: prev.transactionCountThisMonth + 1
    }));
    
    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso.",
    });
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Excluído",
      description: "Transação removida com sucesso.",
    });
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // Calculate current balance
  const calculateBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
  };

  // Calculate total by transaction type (income/expense) for given period
  const calculateTotalByType = (type: TransactionType, periodFilter: 'all' | 'month' | 'week' = filterPeriod) => {
    const filtered = transactions.filter(transaction => {
      const now = new Date();
      const txDate = new Date(transaction.date);
      
      if (periodFilter === 'all') {
        return transaction.type === type;
      } else if (periodFilter === 'month') {
        return transaction.type === type && 
              txDate.getMonth() === now.getMonth() && 
              txDate.getFullYear() === now.getFullYear();
      } else if (periodFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return transaction.type === type && txDate >= oneWeekAgo;
      }
      
      return transaction.type === type;
    });

    return filtered.reduce((acc, transaction) => acc + transaction.amount, 0);
  };

  // Get category breakdown for expenses or incomes
  const getCategoryBreakdown = (type: TransactionType) => {
    const result: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === type) {
        const category = getCategoryById(transaction.categoryId);
        if (category) {
          result[category.name] = (result[category.name] || 0) + transaction.amount;
        }
      }
    });
    
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  // Upgrade to premium plan
  const upgradeToPremium = () => {
    setUserSettings(prev => ({
      ...prev,
      plan: 'premium',
      transactionLimit: Infinity,
    }));
    toast({
      title: "Plano atualizado",
      description: "Você agora tem acesso ao plano premium!",
    });
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      userSettings,
      filteredTransactions,
      filterPeriod,
      addTransaction,
      deleteTransaction,
      getCategoryById,
      calculateBalance,
      calculateTotalByType,
      setFilterPeriod,
      getCategoryBreakdown,
      upgradeToPremium
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the finance context
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
