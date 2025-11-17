import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "./adminLogsService";

/**
 * Promote a user to admin
 */
export async function promoteToAdmin(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // Check if user already has admin role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (existing) {
      console.log('User is already an admin');
      return true;
    }

    // Insert admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (error) {
      console.error('Error promoting to admin:', error);
      return false;
    }

    // Log the action
    await logAdminAction(
      'promote_to_admin',
      userId,
      userEmail,
      { role: 'admin' }
    );

    return true;
  } catch (error) {
    console.error('Failed to promote to admin:', error);
    return false;
  }
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdmin(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // Verificar se o usuário atual é admin
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }
    
    const isCurrentUserAdmin = await checkUserIsAdmin(currentUser.id);
    if (!isCurrentUserAdmin) {
      console.error('Current user is not admin');
      return false;
    }
    
    // Verificar se o usuário tem role de admin antes de tentar deletar
    const { data: existing, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing role:', checkError);
      return false;
    }

    if (!existing) {
      console.log('User is not admin, nothing to revoke');
      return true; // Não é erro, usuário já não é admin
    }

    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (deleteError) {
      console.error('Error revoking admin:', deleteError);
      return false;
    }

    // Log the action
    await logAdminAction(
      'revoke_admin',
      userId,
      userEmail,
      { role: 'user' }
    );

    return true;
  } catch (error) {
    console.error('Failed to revoke admin:', error);
    return false;
  }
}

/**
 * Check if a user has admin role
 */
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}
