
import { supabase } from "@/integrations/supabase/client";
import { UserPlan, UserSettings } from "@/types/finance";
import { handleApiError } from "@/lib/errorHandling";

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
      .select("plan, subscription_end, used_transactions")
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
        usedTransactions: 0,
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

    // Buscar ou criar registro de limites para o mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Buscar registro de limites existente
    const { data: limitsData, error: limitsError } = await supabase
      .from("plan_limits")
      .select("transactions, limit_reached")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    // Definir limite com base no plano
    const transactionLimit = currentPlan === "premium" ? 999999 : 20;
    
    let transactionCountThisMonth = 0;

    if (limitsError && limitsError.code === "PGRST116") {
      // Nenhum registro encontrado, contar transações diretamente e criar registro
      const { count: actualCount, error: countError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

      if (countError) {
        console.error("Erro ao contar transações:", countError);
      } else {
        transactionCountThisMonth = actualCount || 0;
        
        // Criar registro de limites
        const { error: insertError } = await supabase
          .from("plan_limits")
          .insert({
            user_id: userId,
            month: currentMonth,
            year: currentYear,
            transactions: transactionCountThisMonth,
            limit_reached: transactionCountThisMonth >= transactionLimit
          });
        
        if (insertError) {
          console.error("Erro ao criar registro de limites:", insertError);
        }
      }
    } else if (limitsData) {
      transactionCountThisMonth = limitsData.transactions;
    }

    // Buscar contador de transações usadas
    const usedTransactions = profileData?.used_transactions || 0;

    console.log(`Configurações do usuário: plano=${currentPlan}, transações usadas=${usedTransactions}, transações mês=${transactionCountThisMonth}/${transactionLimit}`);

    return {
      plan: currentPlan as UserPlan,
      darkMode: false,
      transactionCountThisMonth,
      transactionLimit,
      subscriptionEnd: subscriptionEnd,
      usedTransactions,
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
      usedTransactions: 0,
    };
  }
}

// upgradeToPremium function removed - payment system temporarily disabled
