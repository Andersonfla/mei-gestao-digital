
import { Transaction, TransactionCategory, UserSettings, TransactionType, MonthlyReport, CategoryBreakdownItem } from "@/types/finance";

export interface FinanceContextType {
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
  refetchUserSettings: () => Promise<any>; // Added missing property
}
