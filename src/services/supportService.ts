import { supabase } from "@/integrations/supabase/client";

export type SupportConversation = {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  rating?: number | null;
  rating_comment?: string | null;
  rated_at?: string | null;
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
 * If the user has a closed conversation, it will be returned (can be reopened by sending a message)
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

    // Check if conversation already exists (open or closed)
    const { data: existing, error: fetchError } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Erro ao buscar conversa existente:', fetchError);
    }

    if (existing) {
      console.log('✅ Conversa existente encontrada:', existing.id, 'Status:', existing.status);
      return { conversation: existing as SupportConversation, error: null };
    }

    console.log('📝 Criando nova conversa...');
    // Create new conversation with status 'open'
    const { data: newConversation, error: createError } = await supabase
      .from('support_conversations')
      .insert({ user_id: user.id, status: 'open' })
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
 * Create a new conversation for the current user (forces new conversation)
 */
export async function createNewConversation(): Promise<{ conversation: SupportConversation | null; error: any }> {
  try {
    console.log('📝 Criando nova conversa...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return { conversation: null, error: 'User not authenticated' };
    }

    const { data: newConversation, error: createError } = await supabase
      .from('support_conversations')
      .insert({ user_id: user.id, status: 'open' })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);
      return { conversation: null, error: createError };
    }

    console.log('✅ Nova conversa criada:', newConversation?.id);
    return { conversation: newConversation as SupportConversation, error: null };
  } catch (error) {
    console.error('❌ Erro geral em createNewConversation:', error);
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
 * If the conversation is closed, it will be reopened automatically
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

    // Check if conversation is closed
    const { data: conversation } = await supabase
      .from('support_conversations')
      .select('status')
      .eq('id', conversationId)
      .single();

    // If conversation is closed, reopen it
    if (conversation && conversation.status === 'closed') {
      console.log('🔓 Reabrindo conversa fechada...');
      const reopened = await reopenConversation(conversationId);
      if (!reopened) {
        console.error('❌ Não foi possível reabrir a conversa');
        return false;
      }
    }

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
    // 1) Buscar conversas (sem embed para evitar dependência de FK)
    const { data: conversations, error } = await supabase
      .from('support_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    if (!conversations || conversations.length === 0) return [];

    // 2) Buscar perfis dos usuários envolvidos nas conversas
    const userIds = Array.from(new Set(conversations.map((c: any) => c.user_id)));
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, plan')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for conversations:', profilesError);
    }

    const profilesById = new Map((profiles || []).map((p: any) => [p.id, p]));

    // 3) Enriquecer conversas com dados do perfil
    return conversations.map((conv: any) => {
      const p = profilesById.get(conv.user_id);
      return {
        ...conv,
        user_email: p?.email,
        user_name: p?.name,
        user_plan: p?.plan,
      } as SupportConversation;
    });
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

/**
 * Rate a conversation (user only, after conversation is closed)
 */
export async function rateConversation(
  conversationId: string, 
  rating: number, 
  comment?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Verify the conversation is closed and belongs to the user
    const { data: conversation, error: fetchError } = await supabase
      .from('support_conversations')
      .select('status, user_id')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      console.error('Error fetching conversation:', fetchError);
      return false;
    }

    if (conversation.user_id !== user.id) {
      console.error('User does not own this conversation');
      return false;
    }

    if (conversation.status !== 'closed') {
      console.error('Cannot rate an open conversation');
      return false;
    }

    const { error } = await supabase
      .from('support_conversations')
      .update({ 
        rating,
        rating_comment: comment || null,
        rated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error rating conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to rate conversation:', error);
    return false;
  }
}
