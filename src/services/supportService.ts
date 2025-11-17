import { supabase } from "@/integrations/supabase/client";

export type SupportConversation = {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  user_email?: string;
  user_name?: string;
  user_plan?: string;
  unread_count?: number;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  sent_by_admin: boolean;
  created_at: string;
};

/**
 * Get or create a conversation for the current user
 */
export async function getOrCreateConversation(): Promise<{ conversation: SupportConversation | null; error: any }> {
  try {
    console.log('🔍 Buscando ou criando conversa...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return { conversation: null, error: 'User not authenticated' };
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Check if conversation already exists
    const { data: existing, error: fetchError } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Erro ao buscar conversa existente:', fetchError);
    }

    if (existing) {
      console.log('✅ Conversa existente encontrada:', existing.id);
      return { conversation: existing as SupportConversation, error: null };
    }

    console.log('📝 Criando nova conversa...');
    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('support_conversations')
      .insert({ user_id: user.id })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);
      return { conversation: null, error: createError };
    }

    console.log('✅ Nova conversa criada:', newConversation?.id);
    return { conversation: newConversation as SupportConversation, error: createError };
  } catch (error) {
    console.error('❌ Erro geral em getOrCreateConversation:', error);
    return { conversation: null, error };
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<SupportMessage[]> {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
}

/**
 * Send a message (user)
 */
export async function sendMessage(conversationId: string, content: string): Promise<boolean> {
  try {
    console.log('📤 Enviando mensagem...');
    console.log('Conversation ID:', conversationId);
    console.log('Content:', content);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não autenticado ao enviar mensagem');
      return false;
    }

    console.log('✅ Usuário autenticado:', user.id);

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        content,
        sent_by_admin: false,
      })
      .select();

    if (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }

    console.log('✅ Mensagem enviada com sucesso:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro geral ao enviar mensagem:', error);
    return false;
  }
}

/**
 * Get all conversations (admin only)
 */
export async function getAllConversations(): Promise<SupportConversation[]> {
  try {
    const { data: conversations, error } = await supabase
      .from('support_conversations')
      .select(`
        *,
        profiles:user_id (
          email,
          name,
          plan
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Format the data
    return conversations.map((conv: any) => ({
      ...conv,
      user_email: conv.profiles?.email,
      user_name: conv.profiles?.name,
      user_plan: conv.profiles?.plan,
    }));
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return [];
  }
}

/**
 * Send a message (admin)
 */
export async function sendAdminMessage(conversationId: string, content: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        content,
        sent_by_admin: true,
      });

    if (error) {
      console.error('Error sending admin message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send admin message:', error);
    return false;
  }
}

/**
 * Close a conversation (admin only)
 */
export async function closeConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('support_conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error closing conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to close conversation:', error);
    return false;
  }
}

/**
 * Reopen a conversation (admin only)
 */
export async function reopenConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('support_conversations')
      .update({ status: 'open' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error reopening conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to reopen conversation:', error);
    return false;
  }
}
