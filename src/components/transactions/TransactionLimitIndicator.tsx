
import { Progress } from "@/components/ui/progress";
import { UserSettings } from "@/types/finance";

interface TransactionLimitIndicatorProps {
  userSettings: UserSettings;
}

export function TransactionLimitIndicator({ userSettings }: TransactionLimitIndicatorProps) {
  // Não exibir nada, já que não há mais plano gratuito
  return null;
}
