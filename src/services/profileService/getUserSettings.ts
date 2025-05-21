
import { supabase } from "@/integrations/supabase/client";
import { UserPlan, UserSettings } from "@/types/finance";
import { updateTransactionLimits } from "./planLimits";

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
      .select("plan, subscription_end")
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
        subscriptionEnd: null,
      };
    }

    // Verificar se o plano premium expirou
    let currentPlan = profileData?.plan || 'free';
    let subscriptionEnd = profileData?.subscription_end ? new Date(profileData.subscription_end) : null;
    
    // Se o plano é premium mas a data de expiração já passou, fazer downgrade automático
    if (currentPlan === 'premium' && subscriptionEnd && subscriptionEnd < new Date()) {
      console.log("Plano premium expirado, fazendo downgrade automático");
      
      // Atualizar o plano para free no banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan: 'free' })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Erro ao fazer downgrade do plano:", updateError);
      } else {
        currentPlan = 'free';
      }
    }

    // Buscar limite de transações para o mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript meses são 0-indexados
    const currentYear = currentDate.getFullYear();

    // Contar diretamente as transações do usuário no mês atual 
    const { count: transactionCount, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .lte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

    if (countError) {
      console.error("Erro ao contar transações:", countError);
    }

    // Consulta específica para verificar as transações do usuário (para debugging)
    const { data: transactionsDebug, error: transactionsError } = await supabase
      .from("transactions")
      .select("id, date")
      .eq("user_id", userId)
      .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .lte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);
    
    if (transactionsError) {
      console.error("Erro ao buscar transações para debug:", transactionsError);
    } else {
      console.log(`Quantidade de transações encontradas: ${transactionsDebug?.length}, userId: ${userId}`);
    }

    // Atualizar os limites de transações para o mês atual
    const actualTransactionCount = transactionCount || 0;
    console.log(`Contagem real de transações: ${actualTransactionCount}`);
    
    // Definir limite com base no plano
    const transactionLimit = currentPlan === "premium" ? 999999 : 20;
    
    await updateTransactionLimits(userId, currentMonth, currentYear, actualTransactionCount, transactionLimit);

    // Sempre use a contagem real de transações do banco
    return {
      plan: currentPlan as UserPlan,
      darkMode: false, // Por enquanto, modo escuro é fixo
      transactionCountThisMonth: actualTransactionCount,
      transactionLimit,
      subscriptionEnd: subscriptionEnd,
    };
  } catch (error) {
    console.error("Erro ao buscar configurações do usuário:", error);
    // Retornar configuração padrão em caso de erro
    return {
      plan: "free" as UserPlan,
      darkMode: false,
      transactionCountThisMonth: 0,
      transactionLimit: 20,
      subscriptionEnd: null,
    };
  }
}
