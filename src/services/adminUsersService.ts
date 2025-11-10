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
};

/**
 * Get all users for admin panel
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, plan, used_transactions, transaction_count, subscription_end")
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
 * Update user plan
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'premium',
  userEmail?: string
): Promise<boolean> {
  try {
    const subscriptionEnd = plan === 'premium' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      : null;

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
      `Alterou plano para ${plan}`,
      userId,
      userEmail,
      { previous_plan: plan === 'premium' ? 'free' : 'premium', new_plan: plan }
    );

    return true;
  } catch (error) {
    console.error("Failed to update user plan:", error);
    return false;
  }
}

/**
 * Delete user (only deletes from profiles, auth deletion requires service role)
 */
export async function deleteUserProfile(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // Delete user's transactions first
    const { error: transError } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (transError) {
      console.error("Error deleting user transactions:", transError);
    }

    // Delete profile
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error deleting user profile:", error);
      return false;
    }

    await logAdminAction(
      "Excluiu usuário",
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
