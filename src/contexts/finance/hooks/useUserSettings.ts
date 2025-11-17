
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { getUserSettings } from "@/services/profileService";
import { useEffect, useMemo } from "react";
import { UserPlan } from "@/types/finance";

/**
 * Hook for managing user settings and plan details
 */
export function useUserSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    data: userSettings, 
    isLoading: isLoadingSettings,
    refetch: refetchUserSettings
  } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: getUserSettings,
    enabled: !!user,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    initialData: {
      plan: 'free' as UserPlan,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
      subscriptionEnd: null,
      usedTransactions: 0,
    },
  });

  // Check if premium plan has expired
  useEffect(() => {
    if ((userSettings?.plan === 'premium' || userSettings?.plan === 'master') && userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      
      if (subscriptionEndDate < currentDate) {
        // Premium plan has expired, trigger verification
        refetchUserSettings();
        
        const planName = userSettings.plan === 'master' ? 'Premium Master' : 'Premium';
        toast({
          title: `⚠️ Plano ${planName} expirado`,
          description: `Seu plano ${planName} expirou. Renove sua assinatura para continuar aproveitando os recursos avançados.`,
          variant: "destructive",
        });
      }
    } else if ((userSettings?.plan === 'premium' || userSettings?.plan === 'master') && userSettings?.subscriptionEnd) {
      // Premium active - show success message once
      const hasShownWelcome = sessionStorage.getItem('premium_welcome_shown');
      if (!hasShownWelcome) {
        const planName = userSettings.plan === 'master' ? 'Premium Master' : 'Premium';
        toast({
          title: `🎉 Plano ${planName} ativo!`,
          description: "Aproveite todos os recursos exclusivos do seu plano.",
        });
        sessionStorage.setItem('premium_welcome_shown', 'true');
      }
    }
  }, [userSettings, refetchUserSettings, toast]);

  // upgradeToPremium functionality temporarily disabled

  const isPremiumActive = useMemo(() => {
    if (!userSettings) return false;
    
    // Verifica se o plano é premium ou master
    const isPremiumPlan = userSettings.plan === 'premium' || userSettings.plan === 'master';
    
    // Se não for premium, retorna false
    if (!isPremiumPlan) return false;
    
    // Se for premium mas não tem data de expiração, considera ativo
    if (!userSettings.subscriptionEnd) return true;
    
    // Se tem data de expiração, verifica se ainda não expirou
    const now = new Date();
    const expirationDate = new Date(userSettings.subscriptionEnd);
    return expirationDate > now;
  }, [userSettings]);

  const isPremiumMasterActive = useMemo(() => {
    if (!userSettings) return false;
    
    // Verifica se o plano é master
    const isMasterPlan = userSettings.plan === 'master';
    
    // Se não for master, retorna false
    if (!isMasterPlan) return false;
    
    // Se for master mas não tem data de expiração, considera ativo
    if (!userSettings.subscriptionEnd) return true;
    
    // Se tem data de expiração, verifica se ainda não expirou
    const now = new Date();
    const expirationDate = new Date(userSettings.subscriptionEnd);
    return expirationDate > now;
  }, [userSettings]);

  return {
    userSettings: userSettings!,
    isLoadingSettings,
    refetchUserSettings,
    isPremiumActive,
    isPremiumMasterActive,
    upgradeToPremium: async () => {
      throw new Error("Sistema de pagamento temporariamente indisponível");
    },
  };
}
