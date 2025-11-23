import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFinance } from "@/contexts";

interface PlanManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanManagementDialog({ open, onOpenChange }: PlanManagementDialogProps) {
  const { userSettings, refetchUserSettings } = useFinance();
  const { toast } = useToast();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleCancelPlan = async () => {
    setIsCanceling(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ canceled_at: new Date().toISOString() })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      await refetchUserSettings();

      toast({
        title: "✅ Plano cancelado",
        description: `Seu plano será cancelado ao final do período pago em ${formatDate(
          userSettings.subscriptionEnd
        )}. Você continuará tendo acesso até lá.`,
      });

      setShowCancelConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao cancelar plano:", error);
      toast({
        title: "Erro ao cancelar plano",
        description: "Não foi possível processar o cancelamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const planName = userSettings.plan === "master" ? "Premium Master" : "Premium";
  const isCanceled = !!userSettings.canceled_at;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Assinatura de Plano</DialogTitle>
            <DialogDescription>
              Visualize os detalhes do seu plano atual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status do Plano */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
                <p className="text-lg font-semibold">{planName}</p>
              </div>
              {isCanceled ? (
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Cancelado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Ativo</span>
                </div>
              )}
            </div>

            {/* Data de Validade */}
            {userSettings.subscriptionEnd && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {isCanceled ? "Expira em" : "Validade até"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(userSettings.subscriptionEnd)}
                  </p>
                  {isCanceled && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                      Seu plano foi cancelado mas você continuará tendo acesso até esta data
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recursos do Plano */}
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Recursos incluídos</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Lançamentos ilimitados</li>
                <li>✓ Relatórios avançados</li>
                <li>✓ Suporte prioritário</li>
                {userSettings.plan === "master" && (
                  <>
                    <li>✓ Dashboard Premium Master</li>
                    <li>✓ Metas financeiras</li>
                    <li>✓ Múltiplas carteiras</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            {!isCanceled && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full"
              >
                Cancelar Plano
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Cancelamento */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Ao cancelar, seu plano {planName} permanecerá ativo até{" "}
                <strong>{formatDate(userSettings.subscriptionEnd)}</strong>.
              </p>
              <p>
                Após essa data, você voltará automaticamente para o plano gratuito com
                limite de 20 lançamentos por mês.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Plano</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPlan}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? "Processando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
