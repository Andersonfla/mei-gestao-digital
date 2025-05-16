
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, PlanLimit, UserSettings } from "@/types/finance";

export async function getUserProfile(): Promise<UserProfile> {
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw userError;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data as UserProfile;
}

export async function getCurrentMonthPlanLimit(): Promise<PlanLimit | null> {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw userError;
  }
  
  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .maybeSingle();

  if (error) {
    console.error('Error fetching plan limits:', error);
    throw error;
  }

  return data as PlanLimit | null;
}

export async function upgradeToPremium(): Promise<void> {
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw userError;
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'premium' })
    .eq('id', user.user.id);

  if (error) {
    console.error('Error upgrading plan:', error);
    throw error;
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  const [profile, planLimit] = await Promise.all([
    getUserProfile(),
    getCurrentMonthPlanLimit()
  ]);
  
  // O limite já está configurado corretamente para 20
  const transactionLimit = 20;
  
  return {
    plan: profile.plan,
    darkMode: false, // Default value as it's not stored in DB yet
    transactionCountThisMonth: planLimit?.transactions || 0,
    transactionLimit: profile.plan === 'free' ? transactionLimit : Infinity
  };
}
