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
    console.log('🔍 Tentando revogar admin para userId:', userId);
    
    // Verificar se o usuário tem role de admin antes de tentar deletar
    const { data: existing, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('📋 Role existente:', existing);
    console.log('❌ Erro ao verificar:', checkError);

    if (checkError) {
      console.error('❌ Erro ao verificar role existente:', checkError);
      return false;
    }

    if (!existing) {
      console.log('⚠️ Usuário não tem role de admin para revogar');
      return true; // Não é erro, usuário já não é admin
    }

    console.log('🗑️ Tentando deletar role de admin...');
    const { data: deleteData, error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin')
      .select();

    console.log('📤 Dados deletados:', deleteData);
    console.log('❌ Erro ao deletar:', deleteError);

    if (deleteError) {
      console.error('❌ Erro detalhado ao revogar admin:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      });
      return false;
    }

    console.log('✅ Admin revogado com sucesso');

    // Log the action
    await logAdminAction(
      'revoke_admin',
      userId,
      userEmail,
      { role: 'user' }
    );

    return true;
  } catch (error) {
    console.error('❌ Erro geral ao revogar admin:', error);
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
