
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, PlanLimit, UserSettings } from "@/types/finance";

export async function getUserProfile(): Promise<UserProfile> {
  // Verificar se há uma sessão ativa
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }

  return data as UserProfile;
}

export async function getCurrentMonthPlanLimit(): Promise<PlanLimit | null> {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  // Verificar se há uma sessão ativa
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar limites do plano:', error);
    throw error;
  }

  // Se não existir um registro para este mês, cria um com contagem zero
  if (!data) {
    const { data: newLimit, error: insertError } = await supabase
      .from('plan_limits')
      .insert({
        user_id: user.id,
        month: currentMonth,
        year: currentYear,
        transactions: 0,
        limit_reached: false
      })
      .select('*')
      .single();
    
    if (insertError) {
      console.error('Erro ao criar registro de limite do plano:', insertError);
      return {
        user_id: user.id,
        month: currentMonth,
        year: currentYear,
        transactions: 0,
        limit_reached: false
      };
    }
    
    return newLimit as PlanLimit;
  }

  return data as PlanLimit;
}

export async function upgradeToPremium(): Promise<void> {
  // Verificar se há uma sessão ativa
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'premium' })
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar plano:', error);
    throw error;
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  // Este método usa getUserProfile e getCurrentMonthPlanLimit que já têm as validações de autenticação
  try {
    const [profile, planLimit] = await Promise.all([
      getUserProfile(),
      getCurrentMonthPlanLimit()
    ]);
    
    // O limite está configurado para 20 transações ou infinito para premium
    const transactionLimit = profile.plan === 'premium' ? Infinity : 20;
    
    return {
      plan: profile.plan,
      darkMode: false, // Valor padrão pois não está armazenado no DB ainda
      transactionCountThisMonth: planLimit?.transactions || 0,
      transactionLimit: transactionLimit
    };
  } catch (error) {
    console.error('Erro ao obter configurações do usuário:', error);
    throw error;
  }
}
