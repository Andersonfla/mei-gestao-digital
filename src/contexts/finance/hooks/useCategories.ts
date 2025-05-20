
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { getCategories } from "@/services/categoryService";
import { TransactionCategory } from "@/types/finance";

/**
 * Hook for managing categories data
 */
export function useCategories() {
  const { user } = useAuth();

  const { 
    data: categories = [] as TransactionCategory[], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: getCategories,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Categories change less frequently
  });

  return {
    categories,
    isLoadingCategories
  };
}
