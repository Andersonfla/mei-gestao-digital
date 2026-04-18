import { Link } from "react-router-dom";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { PLAN_LABELS, type PlanFeature } from "@/lib/planPermissions";
import type { ReactNode } from "react";
import type { UserPlan } from "@/types/finance";

interface FeatureLockProps {
  feature: PlanFeature;
  /** Minimum plan tier required (used only for the upsell copy). Defaults inferred. */
  requiredPlan?: Extract<UserPlan, "premium" | "master">;
  title?: string;
  description?: string;
  children: ReactNode;
}

/**
 * Wrap any UI that should only render when the user's plan grants `feature`.
 * Otherwise shows an upsell card linking to /upgrade.
 */
export function FeatureLock({
  feature,
  requiredPlan = "premium",
  title,
  description,
  children,
}: FeatureLockProps) {
  const { can, isLoading } = usePlanGuard();

  if (isLoading) return null;
  if (can(feature)) return <>{children}</>;

  const planLabel = PLAN_LABELS[requiredPlan];
  const Icon = requiredPlan === "master" ? Crown : Sparkles;

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardContent className="py-10 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title ?? `Disponível no plano ${planLabel}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {description ??
              `Faça upgrade para o plano ${planLabel} para desbloquear este recurso.`}
          </p>
        </div>
        <Button asChild>
          <Link to="/upgrade">Ver planos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
