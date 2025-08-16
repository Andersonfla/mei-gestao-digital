
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { getCategories } from "@/services/categoryService";
import { TransactionCategory } from "@/types/finance";
import { useFinance } from "@/contexts";

// Categorias premium - só disponíveis para usuários premium
const PREMIUM_CATEGORIES = [
  'Anúncios Online (Facebook/Instagram Ads)',
  'Google Ads',
  'TikTok Ads',
  'Tráfego Pago – Outros',
  'Fornecedores / Produtos',
  'Taxas e Impostos',
  'Ferramentas e Softwares'
];

/**
 * Verifica se uma categoria é premium
 */
function isPremiumCategory(categoryName: string): boolean {
  return PREMIUM_CATEGORIES.includes(categoryName);
}

/**
 * Hook for managing categories data
 */
export function useCategories() {
  const { user } = useAuth();
  const { userSettings } = useFinance();

  const { 
    data: allCategories = [] as TransactionCategory[], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: getCategories,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Categories change less frequently
  });

  // Filtrar categorias baseado no plano do usuário
  const categories = allCategories.filter(category => {
    // Se for categoria premium, só mostrar para usuários premium
    if (isPremiumCategory(category.name)) {
      return userSettings.plan === 'premium';
    }
    // Categorias normais são mostradas para todos
    return true;
  });

  return {
    categories,
    isLoadingCategories,
    isPremiumCategory
  };
}
