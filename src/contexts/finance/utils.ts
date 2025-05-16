
import { Transaction, MonthlyReport, CategoryBreakdownItem } from "@/types/finance";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const calculateBalance = (filteredTransactions: Transaction[]): number => {
  return filteredTransactions.reduce((balance, tx) => {
    if (tx.type === 'entrada') {
      return balance + tx.value;
    } else {
      return balance - tx.value;
    }
  }, 0);
};

export const calculateTotalByType = (filteredTransactions: Transaction[], type: 'entrada' | 'saida'): number => {
  return filteredTransactions
    .filter(tx => tx.type === type)
    .reduce((total, tx) => total + tx.value, 0);
};

export const getCategoryBreakdown = (filteredTransactions: Transaction[], type: 'entrada' | 'saida'): CategoryBreakdownItem[] => {
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

export const calculateMonthlyReports = (transactions: Transaction[]): MonthlyReport[] => {
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

export const getDefaultFilterDates = (): { startDate: Date; endDate: Date } => {
  const today = new Date();
  return {
    startDate: startOfMonth(today),
    endDate: endOfMonth(today),
  };
};

export const updateFilterDatesForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const today = new Date();
  
  switch(period) {
    case "week":
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      return {
        startDate: weekStart,
        endDate: today,
      };
    case "month":
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
      };
    case "all":
      const farPast = new Date();
      farPast.setFullYear(farPast.getFullYear() - 5);
      return {
        startDate: farPast,
        endDate: today,
      };
    default:
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
      };
  }
};
