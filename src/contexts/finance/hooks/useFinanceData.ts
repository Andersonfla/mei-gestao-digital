
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import { useUserSettings } from './useUserSettings';
import { useFilterDates } from './useFilterDates';

/**
 * Main finance data hook that combines all other hooks
 */
export function useFinanceData() {
  const { 
    filterDates, 
    filterPeriod, 
    setFilterDates, 
    setFilterPeriod 
  } = useFilterDates();

  const {
    transactions,
    filteredTransactions,
    isLoadingTransactions,
    isLoadingFilteredTransactions,
    refetchTransactions,
    refetchFilteredTransactions,
    addTransaction,
    deleteTransaction
  } = useTransactions(filterDates);

  const {
    categories,
    isLoadingCategories
  } = useCategories();

  const {
    userSettings,
    isLoadingSettings,
    refetchUserSettings,
    upgradeToPremium,
    isPremiumActive
  } = useUserSettings();

  // Combine loading states
  const isLoading = isLoadingTransactions || 
    isLoadingFilteredTransactions || 
    isLoadingCategories || 
    isLoadingSettings;

  return {
    // Data
    transactions,
    filteredTransactions,
    categories,
    userSettings,
    filterDates,
    filterPeriod,
    
    // Loading state
    isLoading,
    
    // Premium status
    isPremiumActive,
    
    // Actions
    addTransaction,
    deleteTransaction,
    upgradeToPremium,
    setFilterDates,
    setFilterPeriod,
    refetchUserSettings
  };
}
