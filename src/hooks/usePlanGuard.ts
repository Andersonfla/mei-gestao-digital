import { useFinance } from "@/contexts";
import { planHasFeature, type PlanFeature } from "@/lib/planPermissions";
import type { UserPlan } from "@/types/finance";

/**
 * Centralized, reusable plan-permission hook.
 * Single source of truth for "can this user access X?".
 *
 * Combines stored plan + real subscription status so a user with
 * plan='premium' but status='canceled'/'past_due' is correctly
 * treated as 'free' until they renew.
 */
export function usePlanGuard() {
  const { userSettings, isPremiumActive, isPremiumMasterActive, isLoading } = useFinance();

  const storedPlan: UserPlan = userSettings?.plan ?? "free";

  // Effective plan = plano só vale se a assinatura realmente está ativa.
  // Master inválido NÃO vira premium — vira free. (Fix: antes caía em premium
  // por causa do `(storedPlan === 'master') && isPremiumActive`.)
  let effectivePlan: UserPlan = "free";
  if (storedPlan === "master") {
    if (isPremiumMasterActive) effectivePlan = "master";
  } else if (storedPlan === "premium") {
    if (isPremiumActive) effectivePlan = "premium";
  }

  const isFree = effectivePlan === "free";
  const isPremium = effectivePlan === "premium" || effectivePlan === "master";
  const isMaster = effectivePlan === "master";

  const can = (feature: PlanFeature) => planHasFeature(effectivePlan, feature);

  return {
    isLoading,
    storedPlan,
    effectivePlan,
    isFree,
    isPremium,
    isMaster,
    can,
    subscriptionStatus: userSettings?.subscriptionStatus ?? null,
    subscriptionEnd: userSettings?.subscriptionEnd ?? null,
  };
}
