import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current user has admin role
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_current_user_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Get current user's roles
 */
export async function getUserRoles() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    return data?.map(r => r.role) || [];
  } catch (error) {
    console.error('Failed to fetch user roles:', error);
    return [];
  }
}
