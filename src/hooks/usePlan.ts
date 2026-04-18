import { useFinance } from "@/contexts";
import { UserPlan } from "@/types/finance";

const VALID_STATUSES = new Set(['active', 'trialing']);

export function usePlan() {
  const { userSettings } = useFinance();

  const storedPlan: UserPlan = userSettings.plan || 'free';

  const now = new Date();
  const expirationDate = userSettings.subscriptionEnd ? new Date(userSettings.subscriptionEnd) : null;
  const expiredByDate = expirationDate ? expirationDate < now : false;
  const invalidStatus = userSettings.subscriptionStatus
    ? !VALID_STATUSES.has(userSettings.subscriptionStatus)
    : false;

  // Se o plano armazenado é pago mas a assinatura está inválida/expirada,
  // tratamos como free no cliente (o webhook já faz o downgrade no banco —
  // isso protege a janela entre o evento e o próximo refetch).
  const isPaidPlan = storedPlan === 'premium' || storedPlan === 'master';
  const accessRevoked = isPaidPlan && (expiredByDate || invalidStatus);
  const plan: UserPlan = accessRevoked ? 'free' : storedPlan;

  const isFree = plan === 'free';
  const isPremium = plan === 'premium' || plan === 'master';
  const isMaster = plan === 'master';
  const expired = expiredByDate || invalidStatus;

  return {
    plan,
    isFree,
    isPremium,
    isMaster,
    expired,
    expirationDate,
    subscriptionStatus: userSettings.subscriptionStatus ?? null,
  };
}
