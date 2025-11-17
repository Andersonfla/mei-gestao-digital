
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
    if (userSettings?.plan === 'premium' && userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      
      if (subscriptionEndDate < currentDate) {
        // Premium plan has expired, trigger verification
        refetchUserSettings();
        
        toast({
          title: "⚠️ Plano Premium expirado",
          description: "Seu plano Premium expirou. Renove sua assinatura para continuar aproveitando os recursos avançados.",
          variant: "destructive",
        });
      }
    } else if (userSettings?.plan === 'premium' && userSettings?.subscriptionEnd) {
      // Premium active - show success message once
      const hasShownWelcome = sessionStorage.getItem('premium_welcome_shown');
      if (!hasShownWelcome) {
        toast({
          title: "🎉 Plano Premium ativo!",
          description: "Aproveite todos os recursos exclusivos do seu plano.",
        });
        sessionStorage.setItem('premium_welcome_shown', 'true');
      }
    }
  }, [userSettings, refetchUserSettings, toast]);

  // upgradeToPremium functionality temporarily disabled

  // Check if the premium plan is active - computed as boolean
  const isPremiumActive = useMemo(() => {
    if (userSettings?.plan !== 'premium' && userSettings?.plan !== 'pro' && userSettings?.plan !== 'premium_master') return false;
    
    if (userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      return subscriptionEndDate > currentDate;
    }
    
    return false;
  }, [userSettings]);

  // Check if Premium Master (Pro) plan is active
  const isPremiumMasterActive = useMemo(() => {
    if (userSettings?.plan !== 'pro' && userSettings?.plan !== 'premium_master') return false;
    
    if (userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      return subscriptionEndDate > currentDate;
    }
    
    return false;
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
