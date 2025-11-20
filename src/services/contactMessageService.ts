import { supabase } from "@/integrations/supabase/client";

export interface ContactMessage {
  id: string;
  nome_completo: string;
  email_contato: string;
  assunto: string;
  mensagem: string;
  data_recebimento: string;
  status: 'pendente' | 'resolvido';
  created_at: string;
  updated_at: string;
}

export async function createContactMessage(data: {
  nome_completo: string;
  email_contato: string;
  assunto: string;
  mensagem: string;
}) {
  const { error } = await supabase
    .from('mensagens_contato')
    .insert(data);

  if (error) {
    console.error('Erro ao criar mensagem:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getPendingMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('mensagens_contato')
    .select('*')
    .eq('status', 'pendente')
    .order('data_recebimento', { ascending: false });

  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }

  return (data || []) as ContactMessage[];
}

export async function getAllMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('mensagens_contato')
    .select('*')
    .order('data_recebimento', { ascending: false });

  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }

  return (data || []) as ContactMessage[];
}

export async function markMessageAsResolved(messageId: string) {
  const { error } = await supabase
    .from('mensagens_contato')
    .update({ status: 'resolvido' })
    .eq('id', messageId);

  if (error) {
    console.error('Erro ao marcar mensagem como resolvida:', error);
    return { success: false, error };
  }

  return { success: true };
}
