
import { supabase } from "@/integrations/supabase/client";

/**
 * Atualizar plano do usuário para premium
 */
export async function upgradeToPremium(): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.session.user.id;
  console.log("Atualizando plano para premium para o usuário:", userId);

  // Definir data de expiração para 30 dias a partir de hoje
  const subscriptionEnd = new Date();
  subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

  const { error } = await supabase
    .from("profiles")
    .update({ 
      plan: "premium",
      subscription_end: subscriptionEnd.toISOString()
    })
    .eq("id", userId);

  if (error) {
    console.error("Erro ao atualizar para premium:", error);
    throw error;
  }

  // Limpar qualquer flag de limite atingido
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  await supabase
    .from("plan_limits")
    .update({ limit_reached: false })
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .eq("year", currentYear);
}
