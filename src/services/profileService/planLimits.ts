
import { supabase } from "@/integrations/supabase/client";

/**
 * Atualizar os limites de transações do usuário para o mês atual
 */
export async function updateTransactionLimits(
  userId: string,
  currentMonth: number,
  currentYear: number,
  transactionCount: number,
  transactionLimit: number
): Promise<void> {
  try {
    // Verificar se existe um registro de limites para este mês/ano
    const { data: limitsData, error: limitsError } = await supabase
      .from("plan_limits")
      .select("transactions, limit_reached")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    // Se não encontrou limites para este mês, criar um novo registro
    if (limitsError && limitsError.code === "PGRST116") {
      // Código PGRST116 geralmente indica que nenhum resultado foi encontrado
      console.log("Criando novo registro de limites para o mês atual");
      
      const { error: insertError } = await supabase
        .from("plan_limits")
        .insert({
          user_id: userId,
          month: currentMonth,
          year: currentYear,
          transactions: transactionCount,
          limit_reached: transactionCount >= transactionLimit
        });
      
      if (insertError) {
        console.error("Erro ao criar limite para o mês:", insertError);
      }
    } else if (limitsData) {
      // Atualizar o registro existente para garantir que reflete a contagem real
      if (limitsData.transactions !== transactionCount) {
        console.log(`Atualizando contagem de ${limitsData.transactions} para ${transactionCount}`);
        const { error: updateError } = await supabase
          .from("plan_limits")
          .update({
            transactions: transactionCount,
            limit_reached: transactionCount >= transactionLimit
          })
          .eq("user_id", userId)
          .eq("month", currentMonth)
          .eq("year", currentYear);
        
        if (updateError) {
          console.error("Erro ao atualizar limite para o mês:", updateError);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar limites de transações:", error);
  }
}
