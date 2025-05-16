
import { supabase } from "@/integrations/supabase/client";
import { TransactionCategory } from "@/types/finance";

export async function getCategories(): Promise<TransactionCategory[]> {
  // Aqui não precisamos filtrar por usuário pois as políticas de RLS já permitem
  // que o usuário veja categorias públicas e suas próprias categorias
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }

  return data as TransactionCategory[];
}

// Adicionar categoria personalizada para o usuário
export async function addCategory(category: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> {
  // Verificar se há uma sessão ativa
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error("Usuário deve estar autenticado para adicionar categorias");
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: session.user.id // Garantir que o user_id seja definido corretamente
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar categoria:', error);
    throw error;
  }

  return data as TransactionCategory;
}

// Verificar se uma categoria pertence ao usuário ou é pública
export async function isUserCategory(categoryId: string): Promise<boolean> {
  // Verificar se há uma sessão ativa
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('categories')
    .select('user_id')
    .eq('id', categoryId)
    .single();

  if (error || !data) return false;
  
  // Retorna true se a categoria for pública (user_id é null) ou pertencer ao usuário
  return data.user_id === null || data.user_id === userId;
}
