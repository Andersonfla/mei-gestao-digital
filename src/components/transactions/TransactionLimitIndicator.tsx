
import { Progress } from "@/components/ui/progress";
import { UserSettings } from "@/types/finance";

interface TransactionLimitIndicatorProps {
  userSettings: UserSettings;
}

export function TransactionLimitIndicator({ userSettings }: TransactionLimitIndicatorProps) {
  // Only show for free plan
  if (userSettings.plan !== 'free') return null;
  
  const remainingTransactions = userSettings.transactionLimit - userSettings.usedTransactions;
  const progressPercentage = (userSettings.usedTransactions / userSettings.transactionLimit) * 100;

  return (
    <div className="mt-2 space-y-1 w-full" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="flex justify-between text-xs text-muted-foreground w-full">
        <span>Lançamentos utilizados</span>
        <span className="font-medium">{userSettings.usedTransactions}/{userSettings.transactionLimit}</span>
      </div>
      <Progress value={progressPercentage} className="h-1.5 w-full" />
      <div className="text-xs text-muted-foreground w-full">
        {remainingTransactions <= 0 ? (
          <span className="text-destructive font-medium">Limite atingido</span>
        ) : (
          `Restam ${remainingTransactions} lançamentos`
        )}
      </div>
    </div>
  );
}
