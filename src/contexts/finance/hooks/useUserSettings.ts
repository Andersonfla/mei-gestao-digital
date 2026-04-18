
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
      canceled_at: null,
      subscriptionStatus: null,
    },
  });

  // Detect expired premium/master and welcome on first activation
  useEffect(() => {
    if (!userSettings) return;
    const isPaid = userSettings.plan === 'premium' || userSettings.plan === 'master';
    if (!isPaid || !userSettings.subscriptionEnd) return;

    const subscriptionEndDate = new Date(userSettings.subscriptionEnd);
    const expired = subscriptionEndDate < new Date();
    const planName = userSettings.plan === 'master' ? 'Premium Master' : 'Premium';

    if (expired) {
      // Plano expirou: webhook deve fazer downgrade; força refetch
      refetchUserSettings();
      toast({
        title: `⚠️ Plano ${planName} expirado`,
        description: `Seu plano ${planName} expirou. Renove sua assinatura para continuar aproveitando os recursos avançados.`,
        variant: "destructive",
      });
      return;
    }

    // Plano ativo: mostra welcome uma vez por sessão
    const hasShownWelcome = sessionStorage.getItem('premium_welcome_shown');
    if (!hasShownWelcome) {
      toast({
        title: `🎉 Plano ${planName} ativo!`,
        description: "Aproveite todos os recursos exclusivos do seu plano.",
      });
      sessionStorage.setItem('premium_welcome_shown', 'true');
    }
  }, [userSettings, refetchUserSettings, toast]);

  // upgradeToPremium functionality temporarily disabled

  // Status do Stripe que mantém o acesso liberado
  const VALID_STATUSES = new Set(['active', 'trialing']);

  const isPremiumActive = useMemo(() => {
    if (!userSettings) return false;

    const isPremiumPlan = userSettings.plan === 'premium' || userSettings.plan === 'master';
    if (!isPremiumPlan) return false;

    // Se houver subscription_status, ele manda: só libera se for active/trialing
    if (userSettings.subscriptionStatus) {
      if (!VALID_STATUSES.has(userSettings.subscriptionStatus)) return false;
    }

    // Se tem data de expiração, verifica se ainda não expirou
    if (userSettings.subscriptionEnd) {
      const now = new Date();
      const expirationDate = new Date(userSettings.subscriptionEnd);
      return expirationDate > now;
    }

    return true;
  }, [userSettings]);

  const isPremiumMasterActive = useMemo(() => {
    if (!userSettings) return false;
    if (userSettings.plan !== 'master') return false;

    if (userSettings.subscriptionStatus) {
      if (!VALID_STATUSES.has(userSettings.subscriptionStatus)) return false;
    }

    if (userSettings.subscriptionEnd) {
      const now = new Date();
      const expirationDate = new Date(userSettings.subscriptionEnd);
      return expirationDate > now;
    }

    return true;
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
