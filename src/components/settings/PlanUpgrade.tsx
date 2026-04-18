import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2, Crown, Sparkles, AlertTriangle, XCircle, Clock } from "lucide-react";
import { useFinance } from "@/contexts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PREMIUM_FEATURE_LIST,
  MASTER_FEATURE_LIST,
  FREE_FEATURE_LIST,
  PLAN_PRICES,
  PLAN_LABELS,
} from "@/lib/planPermissions";
import type { SubscriptionStatus, UserPlan } from "@/types/finance";

type PlanKey = "premium" | "master";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function StatusBadge({ status, isCurrentPlanActive }: { status: SubscriptionStatus; isCurrentPlanActive: boolean }) {
  if (isCurrentPlanActive && (status === "active" || status === "trialing")) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">
        <Check className="w-3 h-3 mr-1" />
        {status === "trialing" ? "Em período de teste" : "Assinatura ativa"}
      </Badge>
    );
  }
  switch (status) {
    case "past_due":
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pagamento pendente
        </Badge>
      );
    case "unpaid":
      return (
        <Badge variant="outline" className="border-red-500/40 text-red-700 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          Não pago
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelada
        </Badge>
      );
    case "incomplete":
    case "incomplete_expired":
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
          <Clock className="w-3 h-3 mr-1" />
          Incompleta
        </Badge>
      );
    default:
      return null;
  }
}

function PlanStatusAlert({
  status,
  subscriptionEnd,
  canceledAt,
  isActive,
}: {
  status: SubscriptionStatus;
  subscriptionEnd: Date | null | undefined;
  canceledAt: Date | null | undefined;
  isActive: boolean;
}) {
  if (status === "past_due" || status === "unpaid") {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Pagamento pendente</AlertTitle>
        <AlertDescription>
          Não conseguimos processar a última cobrança. Atualize seu método de pagamento para manter o acesso ao seu plano.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === "canceled" || (canceledAt && !isActive)) {
    return (
      <Alert className="mb-6 border-amber-500/40">
        <Clock className="h-4 w-4" />
        <AlertTitle>Assinatura cancelada</AlertTitle>
        <AlertDescription>
          {subscriptionEnd && new Date(subscriptionEnd) > new Date()
            ? `Você ainda tem acesso até ${formatDate(subscriptionEnd)}. Após essa data, sua conta voltará ao plano Gratuito.`
            : "Sua assinatura foi encerrada e você está no plano Gratuito. Assine novamente para retomar o acesso."}
        </AlertDescription>
      </Alert>
    );
  }
  if (status === "incomplete" || status === "incomplete_expired") {
    return (
      <Alert className="mb-6 border-amber-500/40">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Assinatura incompleta</AlertTitle>
        <AlertDescription>
          Detectamos um problema na finalização do pagamento. Tente assinar novamente.
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

interface PlanCardProps {
  planKey: UserPlan;
  title: string;
  description: string;
  price: number;
  features: string[];
  isCurrent?: boolean;
  isActive?: boolean;
  highlight?: boolean;
  badgeLabel?: string;
  onSubscribe?: () => void;
  loading?: boolean;
  ctaLabel?: string;
  hideCta?: boolean;
  icon?: React.ReactNode;
}

function PlanCard({
  title,
  description,
  price,
  features,
  isCurrent,
  isActive,
  highlight,
  badgeLabel,
  onSubscribe,
  loading,
  ctaLabel,
  hideCta,
  icon,
}: PlanCardProps) {
  return (
    <Card
      className={`relative shadow-sm transition-all ${
        isCurrent ? "border-2 border-primary ring-2 ring-primary/20" : highlight ? "border-2 border-primary/60" : "border"
      }`}
    >
      {(isCurrent || badgeLabel) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
          {isCurrent ? "Plano Atual" : badgeLabel}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-primary">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[180px]">
        <div className="text-3xl font-bold mb-4">
          {price === 0 ? (
            "Grátis"
          ) : (
            <>
              {formatBRL(price)}
              <span className="text-base font-normal text-muted-foreground">/mês</span>
            </>
          )}
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {!hideCta && onSubscribe && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={onSubscribe}
            disabled={loading}
            variant={isCurrent ? "outline" : "default"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              ctaLabel ?? "Assinar"
            )}
          </Button>
        </CardFooter>
      )}
      {hideCta && isActive && (
        <CardFooter>
          <div className="w-full text-center text-sm text-muted-foreground py-2">
            Você já está neste plano
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export function PlanUpgrade() {
  const { userSettings, isPremiumActive, isPremiumMasterActive } = useFinance();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const currentPlan: UserPlan = userSettings.plan ?? "free";
  const status: SubscriptionStatus = userSettings.subscriptionStatus ?? null;
  const subscriptionEnd = userSettings.subscriptionEnd ?? null;
  const canceledAt = userSettings.canceled_at ?? null;

  const isMasterCurrent = currentPlan === "master";
  const isPremiumCurrent = currentPlan === "premium";
  const isFreeCurrent = currentPlan === "free";
  const hasActiveSub = isPremiumActive || isPremiumMasterActive;

  const handleSubscribe = async (plan: PlanKey) => {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não recebida");
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro ao criar checkout:", err);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar pagamento",
        description:
          err instanceof Error
            ? err.message
            : "Não foi possível abrir o checkout. Tente novamente.",
      });
      setLoadingPlan(null);
    }
  };

  // Status do plano atual (para CTA "Renovar" quando assinatura inválida)
  const currentPlanInactive =
    (isPremiumCurrent && !isPremiumActive) || (isMasterCurrent && !isPremiumMasterActive);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Resumo da assinatura atual */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardDescription className="text-xs uppercase tracking-wider mb-1">
                Plano atual
              </CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {isMasterCurrent && <Crown className="w-6 h-6 text-primary" />}
                {isPremiumCurrent && <Sparkles className="w-6 h-6 text-primary" />}
                {PLAN_LABELS[currentPlan]}
              </CardTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isFreeCurrent ? (
                <Badge variant="secondary">Grátis</Badge>
              ) : (
                <>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatBRL(PLAN_PRICES[currentPlan])}</div>
                    <div className="text-xs text-muted-foreground">por mês</div>
                  </div>
                  <StatusBadge status={status} isCurrentPlanActive={hasActiveSub} />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {!isFreeCurrent && (
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            {subscriptionEnd && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {status === "canceled" || canceledAt ? "Acesso até" : "Próxima renovação"}
                </div>
                <div className="font-medium">{formatDate(subscriptionEnd)}</div>
              </div>
            )}
            {canceledAt && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Cancelada em
                </div>
                <div className="font-medium">{formatDate(canceledAt)}</div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Alerta de status problemático */}
      <PlanStatusAlert
        status={status}
        subscriptionEnd={subscriptionEnd}
        canceledAt={canceledAt}
        isActive={hasActiveSub}
      />

      {/* Cards dos planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard
          planKey="free"
          title="Gratuito"
          description="Para começar a organizar seu MEI"
          price={PLAN_PRICES.free}
          features={FREE_FEATURE_LIST}
          isCurrent={isFreeCurrent}
          isActive={isFreeCurrent}
          hideCta
        />

        <PlanCard
          planKey="premium"
          title="Premium"
          description="Recursos avançados para crescer"
          price={PLAN_PRICES.premium}
          features={PREMIUM_FEATURE_LIST}
          isCurrent={isPremiumCurrent && isPremiumActive && !isMasterCurrent}
          isActive={isPremiumCurrent && isPremiumActive}
          highlight={isFreeCurrent}
          icon={<Sparkles className="w-5 h-5 text-primary" />}
          onSubscribe={
            isMasterCurrent && hasActiveSub
              ? undefined
              : () => handleSubscribe("premium")
          }
          loading={loadingPlan === "premium"}
          ctaLabel={
            isPremiumCurrent && currentPlanInactive
              ? "Renovar Premium"
              : isPremiumCurrent && isPremiumActive
              ? "Você está neste plano"
              : "Assinar Premium"
          }
          hideCta={isMasterCurrent && hasActiveSub}
        />

        <PlanCard
          planKey="master"
          title="Premium Master"
          description="Recursos profissionais completos"
          price={PLAN_PRICES.master}
          features={MASTER_FEATURE_LIST}
          isCurrent={isMasterCurrent && isPremiumMasterActive}
          isActive={isMasterCurrent && isPremiumMasterActive}
          highlight={!isMasterCurrent}
          badgeLabel={!isMasterCurrent ? "Recomendado" : undefined}
          icon={<Crown className="w-5 h-5 text-primary" />}
          onSubscribe={() => handleSubscribe("master")}
          loading={loadingPlan === "master"}
          ctaLabel={
            isMasterCurrent && currentPlanInactive
              ? "Renovar Master"
              : isMasterCurrent && isPremiumMasterActive
              ? "Você está neste plano"
              : isPremiumCurrent
              ? "Fazer upgrade para Master"
              : "Assinar Master"
          }
          hideCta={isMasterCurrent && isPremiumMasterActive}
        />
      </div>
    </div>
  );
}

export function PlanUpgradeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
