
export type TransactionType = 'income' | 'expense';

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
};

export type Transaction = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
};

export type MonthlyReport = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  transactions: Transaction[];
};

export type UserPlan = 'free' | 'premium';

export type UserSettings = {
  plan: UserPlan;
  darkMode: boolean;
  transactionCountThisMonth: number;
  transactionLimit: number;
};
