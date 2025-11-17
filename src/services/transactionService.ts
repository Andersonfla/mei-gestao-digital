
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";
import { handleApiError } from "@/lib/errorHandling";

/**
 * Buscar todas as transações do usuário autenticado.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    throw new Error("Autenticação necessária");
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações:', error);
    throw new Error(`Falha ao carregar transações: ${error.message}`);
  }

  return data as unknown as Transaction[];
}

/**
 * Buscar transações do usuário autenticado dentro de um período específico
 */
export async function getFilteredTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    throw new Error("Autenticação necessária");
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return data as unknown as Transaction[];
}

/**
 * Verificar se o usuário pode adicionar mais transações baseado em used_transactions
 */
async function canAddTransaction(): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }
  
  const userId = session.session.user.id;
  
  // Buscar perfil do usuário para verificar plano e used_transactions
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan, used_transactions')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Erro ao verificar limite de transações:", error);
    return false;
  }
  
  // Usuários premium e premium master não têm limite
  if (profile?.plan === 'premium' || profile?.plan === 'master') {
    return true;
  }
  
  // Usuários free têm limite de 20 transações
  const usedTransactions = profile?.used_transactions || 0;
  const canAdd = usedTransactions < 20;
  
  console.log(`Verificação de limite: used_transactions=${usedTransactions}/20, pode adicionar=${canAdd}`);
  return canAdd;
}

/**
 * Adicionar nova transação para o usuário autenticado.
 */
export async function addTransaction(
  transaction: Omit<Transaction, "id" | "created_at" | "user_id">
): Promise<Transaction> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    throw new Error("Você precisa estar logado para adicionar transações");
  }

  const userId = session.session.user.id;
  
  // Verificar se o usuário pode adicionar mais transações
  const canAdd = await canAddTransaction();
  if (!canAdd) {
    throw new Error("Limite de transações atingido para o plano gratuito");
  }

  // Formatar a data
  const formattedDate = transaction.date instanceof Date
    ? format(transaction.date, 'yyyy-MM-dd')
    : transaction.date;

  // Inserir a transação principal com o user_id explícito
  const formattedTransaction = {
    type: transaction.type,
    category: transaction.category,
    description: transaction.description || "",
    value: transaction.value,
    date: formattedDate,
    user_id: userId
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert(formattedTransaction)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Incrementar contador de transações usadas (não diminui com exclusões)
  const { error: incrementError } = await supabase.rpc('increment_used_transactions', {
    user_id_param: userId
  });

  if (incrementError) {
    console.error("Erro ao incrementar contador de transações:", incrementError);
    // Não bloqueia a transação se o incremento falhar
  }

  return data as unknown as Transaction;
}

/**
 * Excluir uma transação por ID.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    throw new Error("Autenticação necessária");
  }
  
  const userId = session.session.user.id;
  
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
