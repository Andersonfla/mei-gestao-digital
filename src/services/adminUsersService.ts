import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "./adminLogsService";

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
  plan: 'free' | 'premium' | 'pro',
  userEmail?: string,
  durationMonths?: number
): Promise<boolean> {
  try {
    let subscriptionEnd = null;
    
    if (plan !== 'free' && durationMonths) {
      subscriptionEnd = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (plan === 'premium' && !durationMonths) {
      subscriptionEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // default 1 year
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        plan,
        subscription_end: subscriptionEnd
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user plan:", error);
      return false;
    }

    await logAdminAction(
      `Alterou plano para ${plan}${durationMonths ? ` (${durationMonths} meses)` : ''}`,
      userId,
      userEmail,
      { new_plan: plan, duration_months: durationMonths }
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
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user status:", error);
      return false;
    }

    await logAdminAction(
      status === 'suspended' ? 'Suspendeu usuário' : 'Ativou usuário',
      userId,
      userEmail,
      { status }
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
    // Call RPC function to delete user completely
    const { error } = await supabase.rpc('delete_user_completely', {
      target_user_id: userId
    });

    if (error) {
      console.error("Error deleting user completely:", error);
      return false;
    }

    await logAdminAction(
      "Excluiu usuário completamente",
      userId,
      userEmail
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
