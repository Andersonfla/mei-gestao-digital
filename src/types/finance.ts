
export type TransactionType = 'entrada' | 'saida';

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  description?: string | null;
  value: number;
  date: Date | string;
  created_at: Date | string;
};

export type MonthlyReport = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  transactions: Transaction[];
};

export type UserPlan = 'free' | 'premium' | 'pro' | 'premium_master';

export type UserProfile = {
  id: string;
  name: string;
  plan: UserPlan;
  created_at: Date | string;
  updated_at: Date | string;
};

export type PlanLimit = {
  user_id: string;
  month: number;
  year: number;
  transactions: number;
  limit_reached: boolean;
};

export type UserSettings = {
  plan: UserPlan;
  darkMode: boolean;
  transactionCountThisMonth: number;
  transactionLimit: number;
  subscriptionEnd?: Date | null; // Data de expiração do plano premium
  usedTransactions: number; // Total de transações já criadas (não diminui com exclusões)
};

export type CategoryBreakdownItem = {
  name: string;
  value: number;
  percent: number;
};

export type Wallet = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

export type CustomCategory = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  created_at: Date | string;
  updated_at: Date | string;
};

export type Backup = {
  id: string;
  user_id: string;
  file_url?: string | null;
  file_data?: any;
  generated_at: Date | string;
};
