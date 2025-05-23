
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { getUserSettings, upgradeToPremium as upgradeToPremiumService } from "@/services/profileService";
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
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: {
      plan: 'free' as UserPlan,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
      subscriptionEnd: null,
    },
  });

  // Revalidate user settings periodically to check subscription status
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user?.id) {
        refetchUserSettings();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchUserSettings, user?.id]);

  // Check if premium plan has expired
  useEffect(() => {
    if (userSettings?.plan === 'premium' && userSettings?.subscriptionEnd) {
      const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
      const currentDate = new Date();
      
      if (subscriptionEndDate < currentDate) {
        // O plano premium expirou, acionar verificação
        refetchUserSettings();
        
        toast({
          title: "Plano Premium expirado",
          description: "Seu plano Premium expirou. Para continuar usando os recursos avançados, renove sua assinatura mensal.",
          variant: "destructive",
        });
      }
    }
  }, [userSettings, refetchUserSettings, toast]);

  // Mutation for upgrading to premium
  const upgradeToPremiumMutation = useMutation({
    mutationFn: upgradeToPremiumService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      refetchUserSettings();
      
      toast({
        title: "Plano atualizado",
        description: "Seu plano foi atualizado para Premium com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o plano",
        variant: "destructive",
      });
    },
  });

  // Verifica se o plano premium está ativo
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
    upgradeToPremium: () => 
      upgradeToPremiumMutation.mutateAsync(),
  };
}
