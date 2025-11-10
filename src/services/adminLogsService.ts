import { supabase } from "@/integrations/supabase/client";

export type AdminLog = {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string | null;
  target_user_email?: string | null;
  details?: any;
  created_at: string;
};

/**
 * Log an admin action
 */
export async function logAdminAction(
  action: string,
  targetUserId?: string | null,
  targetUserEmail?: string | null,
  details?: any
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user found for admin log");
      return;
    }

    const { error } = await supabase
      .from("admin_logs")
      .insert({
        admin_user_id: user.id,
        action,
        target_user_id: targetUserId,
        target_user_email: targetUserEmail,
        details,
      });

    if (error) {
      console.error("Error logging admin action:", error);
    }
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

/**
 * Get all admin logs
 */
export async function getAdminLogs(): Promise<AdminLog[]> {
  try {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching admin logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch admin logs:", error);
    return [];
  }
}
