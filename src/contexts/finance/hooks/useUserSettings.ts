
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { getUserSettings } from "@/services/profileService";
import { useEffect } from "react";
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
          title: "Plano Premium expirado",
          description: "Seu plano Premium expirou. Para continuar usando os recursos avançados, renove sua assinatura mensal.",
          variant: "destructive",
        });
      }
    }
  }, [userSettings, refetchUserSettings, toast]);

  // upgradeToPremium functionality temporarily disabled

  // Check if the premium plan is active
  const isPremiumActive = () => {
    if (userSettings?.plan !== 'premium') return false;
    
    if (userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      return subscriptionEndDate > currentDate;
    }
    
    return false;
  };

  return {
    userSettings: userSettings!,
    isLoadingSettings,
    refetchUserSettings,
    isPremiumActive,
    upgradeToPremium: async () => {
      throw new Error("Sistema de pagamento temporariamente indisponível");
    },
  };
}
