
import { Progress } from "@/components/ui/progress";
import { UserSettings } from "@/types/finance";

interface TransactionLimitIndicatorProps {
  userSettings: UserSettings;
}

export function TransactionLimitIndicator({ userSettings }: TransactionLimitIndicatorProps) {
  // Only show for free plan
  if (userSettings.plan !== 'free') return null;
  
  const remainingTransactions = userSettings.transactionLimit - userSettings.transactionCountThisMonth;
  const progressPercentage = (userSettings.transactionCountThisMonth / userSettings.transactionLimit) * 100;

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Lançamentos utilizados</span>
        <span className="font-medium">{userSettings.transactionCountThisMonth}/{userSettings.transactionLimit}</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="text-xs text-muted-foreground text-right">
        {remainingTransactions === 0 ? (
          <span className="text-destructive font-medium">Limite atingido</span>
        ) : (
          `Restam ${remainingTransactions} lançamentos`
        )}
      </div>
    </div>
  );
}
