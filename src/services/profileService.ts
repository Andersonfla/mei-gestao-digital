
import { supabase } from "@/integrations/supabase/client";
import { UserPlan, UserSettings } from "@/types/finance";

/**
 * Buscar configurações de usuário autenticado
 */
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    const userId = session.session.user.id;
    console.log("Buscando configurações para o usuário:", userId);

    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("plan, transaction_count")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil do usuário:", profileError);
      // Retornar configuração padrão em caso de erro
      return {
        plan: "free" as UserPlan,
        darkMode: false,
        transactionCountThisMonth: 0,
        transactionLimit: 20,
      };
    }

    // Buscar limite de transações para o mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript meses são 0-indexados
    const currentYear = currentDate.getFullYear();

    // Contar diretamente as transações do usuário no mês atual para garantir precisão
    const { count: transactionCount, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: false })
      .eq("user_id", userId)
      .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .lte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

    if (countError) {
      console.error("Erro ao contar transações:", countError);
    }

    // Verificar se existe um registro de limites para este mês/ano
    const { data: limitsData, error: limitsError } = await supabase
      .from("plan_limits")
      .select("transactions, limit_reached")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    // Definir limite com base no plano
    const transactionLimit = profileData?.plan === "premium" ? 999999 : 20;
    
    // Calcular contagem de transações do banco de dados (mais confiável)
    const actualTransactionCount = transactionCount || 0;
    
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
          transactions: actualTransactionCount, // Usar contagem real
          limit_reached: actualTransactionCount >= transactionLimit
        });
      
      if (insertError) {
        console.error("Erro ao criar limite para o mês:", insertError);
      }
    } else if (limitsData) {
      // Atualizar o registro existente para garantir que reflete a contagem real
      if (limitsData.transactions !== actualTransactionCount) {
        const { error: updateError } = await supabase
          .from("plan_limits")
          .update({
            transactions: actualTransactionCount,
            limit_reached: actualTransactionCount >= transactionLimit
          })
          .eq("user_id", userId)
          .eq("month", currentMonth)
          .eq("year", currentYear);
        
        if (updateError) {
          console.error("Erro ao atualizar limite para o mês:", updateError);
        }
      }
    }

    // Sempre use a contagem real de transações do banco
    return {
      plan: (profileData?.plan || "free") as UserPlan,
      darkMode: false, // Por enquanto, modo escuro é fixo
      transactionCountThisMonth: actualTransactionCount,
      transactionLimit,
    };
  } catch (error) {
    console.error("Erro ao buscar configurações do usuário:", error);
    // Retornar configuração padrão em caso de erro
    return {
      plan: "free" as UserPlan,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
    };
  }
}

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

  const { error } = await supabase
    .from("profiles")
    .update({ plan: "premium" })
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
