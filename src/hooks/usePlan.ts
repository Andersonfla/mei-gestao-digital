import { useFinance } from "@/contexts";
import { UserPlan } from "@/types/finance";

export function usePlan() {
  const { userSettings } = useFinance();
  
  const plan: UserPlan = userSettings.plan || 'free';
  const isFree = plan === 'free';
  const isPremium = plan === 'premium' || plan === 'master';
  const isMaster = plan === 'master';
  
  // Verificar se o plano expirou
  const now = new Date();
  const expirationDate = userSettings.subscriptionEnd ? new Date(userSettings.subscriptionEnd) : null;
  const expired = expirationDate ? expirationDate < now : false;
  
  return {
    plan,
    isFree,
    isPremium,
    isMaster,
    expired,
    expirationDate
  };
}
