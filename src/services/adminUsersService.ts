import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "./adminLogsService";

// Admin user management service
export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  plan: string | null;
  used_transactions: number;
  transaction_count: number;
  subscription_end: string | null;
  status: string | null;
};

/**
 * Get all users for admin panel
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, plan, used_transactions, transaction_count, subscription_end, status")
      .order("email", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

/**
 * Update user plan with custom duration
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'premium' | 'master',
  userEmail?: string,
  durationMonths?: number
): Promise<boolean> {
  try {
    // Buscar plano anterior para registro completo no log
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("plan, subscription_end")
      .eq("id", userId)
      .single();

    const oldPlan = currentProfile?.plan || 'free';
    const oldSubscriptionEnd = currentProfile?.subscription_end;
    
    let subscriptionEnd = null;
    
    // Para plano free, sempre null
    if (plan === 'free') {
      subscriptionEnd = null;
    } 
    // Para premium/master com duração especificada
    else if (durationMonths && durationMonths > 0) {
      const now = new Date();
      now.setMonth(now.getMonth() + durationMonths);
      subscriptionEnd = now.toISOString();
    } 
    // Para premium/master sem duração especificada, default 1 ano
    else {
      const now = new Date();
      now.setFullYear(now.getFullYear() + 1);
      subscriptionEnd = now.toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        plan,
        subscription_end: subscriptionEnd,
        status: 'active'
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user plan:", error);
      return false;
    }

    // Determinar tipo de mudança (upgrade/downgrade/renovação)
    const planHierarchy = { free: 0, premium: 1, master: 2 };
    const changeType = 
      planHierarchy[plan as keyof typeof planHierarchy] > planHierarchy[oldPlan as keyof typeof planHierarchy] 
        ? 'upgrade' 
        : planHierarchy[plan as keyof typeof planHierarchy] < planHierarchy[oldPlan as keyof typeof planHierarchy]
        ? 'downgrade'
        : 'renovação';

    const planNames = {
      free: 'Gratuito',
      premium: 'Premium',
      master: 'Premium Master'
    };

    await logAdminAction(
      `${changeType === 'upgrade' ? '⬆️ Upgrade' : changeType === 'downgrade' ? '⬇️ Downgrade' : '🔄 Renovação'} de plano: ${planNames[oldPlan as keyof typeof planNames] || oldPlan} → ${planNames[plan as keyof typeof planNames]}`,
      userId,
      userEmail,
      { 
        change_type: changeType,
        old_plan: oldPlan,
        new_plan: plan,
        old_subscription_end: oldSubscriptionEnd,
        new_subscription_end: subscriptionEnd,
        duration_months: durationMonths || (plan === 'free' ? 0 : 12),
      }
    );

    return true;
  } catch (error) {
    console.error("Failed to update user plan:", error);
    return false;
  }
}

/**
 * Suspend or activate user account
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended',
  userEmail?: string
): Promise<boolean> {
  try {
    // Buscar status anterior
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("status, plan")
      .eq("id", userId)
      .single();

    const oldStatus = currentProfile?.status || 'active';

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user status:", error);
      return false;
    }

    await logAdminAction(
      status === 'suspended' ? '🚫 Suspendeu conta de usuário' : '✅ Reativou conta de usuário',
      userId,
      userEmail,
      { 
        old_status: oldStatus,
        new_status: status,
        user_plan: currentProfile?.plan,
        action_type: status === 'suspended' ? 'suspension' : 'reactivation'
      }
    );

    return true;
  } catch (error) {
    console.error("Failed to update user status:", error);
    return false;
  }
}

/**
 * Delete user completely (including auth.users)
 */
export async function deleteUserProfile(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // Buscar dados do usuário antes de excluir para log completo
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("plan, subscription_end, used_transactions, transaction_count")
      .eq("id", userId)
      .single();

    // Call RPC function to delete user completely
    const { error } = await supabase.rpc('delete_user_completely' as any, {
      target_user_id: userId
    });

    if (error) {
      console.error("Error deleting user completely:", error);
      return false;
    }

    await logAdminAction(
      "🗑️ Excluiu usuário permanentemente do sistema",
      userId,
      userEmail,
      {
        action_type: 'permanent_deletion',
        deleted_user_plan: userProfile?.plan,
        deleted_user_subscription_end: userProfile?.subscription_end,
        deleted_user_transactions: userProfile?.transaction_count,
        deleted_user_used_transactions: userProfile?.used_transactions
      }
    );

    return true;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("plan");

    const { data: transactions } = await supabase
      .from("transactions")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    const totalUsers = profiles?.length || 0;
    const freeUsers = profiles?.filter(p => p.plan === 'free').length || 0;
    const premiumUsers = profiles?.filter(p => p.plan === 'premium').length || 0;
    const lastTransaction = transactions?.[0]?.created_at || null;

    return {
      totalUsers,
      freeUsers,
      premiumUsers,
      lastTransaction,
    };
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return {
      totalUsers: 0,
      freeUsers: 0,
      premiumUsers: 0,
      lastTransaction: null,
    };
  }
}
