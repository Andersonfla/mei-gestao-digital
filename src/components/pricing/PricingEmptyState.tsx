import { Package } from "lucide-react";

interface PricingEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PricingEmptyState({ title, description, icon }: PricingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        {icon || <Package className="h-8 w-8 text-primary" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
