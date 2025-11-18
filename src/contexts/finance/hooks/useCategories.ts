
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { getCategories } from "@/services/categoryService";
import { TransactionCategory } from "@/types/finance";
import { getUserSettings } from "@/services/profileService";

// Categorias premium - só disponíveis para usuários premium e premium master
const PREMIUM_CATEGORIES = [
  // Categorias de Despesa (saída)
  'Anúncios Online (Facebook/Instagram Ads)',
  'Google Ads',
  'TikTok Ads',
  'Tráfego Pago – Outros',
  'Fornecedores / Produtos',
  'Taxas e Impostos',
  'Ferramentas e Softwares',
  'Salários e Pró-Labore',
  'Despesas com Contabilidade/Jurídico',
  'Manutenção de Equipamentos/Softwares',
  'Custo de Aquisição de Cliente (CAC)',
  // Categorias de Receita (entrada)
  'Vendas de Produtos Digitais (Cursos, E-books)',
  'Comissões e Afiliados',
  'Rendimentos Financeiros (Investimentos)',
  'Reembolsos e Estornos',
  'Receita de Publicidade/Patrocínio',
  'Doações/Apoios (Crowdfunding)'
];

/**
 * Verifica se uma categoria é premium
 */
function isPremiumCategory(categoryName: string): boolean {
  return PREMIUM_CATEGORIES.includes(categoryName);
}

/**
 * Hook for managing categories data - ISOLATED VERSION
 */
export function useCategories() {
  const { user } = useAuth();

  // Buscar configurações do usuário diretamente, sem usar hooks
  const { 
    data: userSettings,
    isLoading: isLoadingUserSettings 
  } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: getUserSettings,
    enabled: !!user,
    initialData: {
      plan: 'free' as any,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
      subscriptionEnd: null,
      usedTransactions: 0,
    },
  });

  const { 
    data: allCategories = [] as TransactionCategory[], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: getCategories,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Categories change less frequently
  });

  // Verificar se o plano premium está ativo (não expirado)
  // Premium Master herda TODAS as permissões do Premium
  const isPremiumActive = () => {
    const isPremiumOrMaster = userSettings?.plan === 'premium' || userSettings?.plan === 'master';
    
    if (!isPremiumOrMaster) return false;
    
    if (userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      return subscriptionEndDate > currentDate;
    }
    
    return false;
  };

  // Filtrar categorias baseado no plano do usuário
  const categories = allCategories.filter(category => {
    // Se for categoria premium, só mostrar para usuários premium ATIVOS
    if (isPremiumCategory(category.name)) {
      return isPremiumActive();
    }
    // Categorias normais são mostradas para todos
    return true;
  });

  return {
    categories,
    isLoadingCategories: isLoadingCategories || isLoadingUserSettings,
    isPremiumCategory
  };
}
