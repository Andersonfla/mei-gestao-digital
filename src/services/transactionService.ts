import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";

/**
 * Buscar todas as transações do usuário autenticado.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para getTransactions");
    throw new Error("Autenticação necessária");
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }

  return data as Transaction[];
}

/**
 * Adicionar nova transação para o usuário autenticado.
 */
export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at'>
): Promise<Transaction> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para addTransaction");
    throw new Error("Você precisa estar logado para adicionar transações");
  }

  const formattedTransaction = {
    ...transaction,
    user_id: session.user.id,
    date: transaction.date instanceof Date
      ? format(transaction.date, 'yyyy-MM-dd')
      : transaction.date,
  };

  console.log("🚀 Enviando transação:", formattedTransaction);

  const { data, error } = await supabase
    .from('transactions')
    .insert(formattedTransaction)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }

  return data as Transaction;
}

/**
 * Deletar uma transação específica do usuário autenticado.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para deleteTransaction");
    throw new Error("Você precisa estar logado para excluir transações");
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
}

/**
 * Filtrar transações por data (opcionalmente startDate e endDate).
 */
export async function getFilteredTransactions(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<Transaction[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para getFilteredTransactions");
    throw new Error("Autenticação necessária");
  }

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id);

  if (startDate) {
    const formattedStartDate = startDate instanceof Date
      ? format(startDate, 'yyyy-MM-dd')
      : startDate;
    query = query.gte('date', formattedStartDate);
  }

  if (endDate) {
    const formattedEndDate = endDate instanceof Date
      ? format(endDate, 'yyyy-MM-dd')
      : endDate;
    query = query.lte('date', formattedEndDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações filtradas:', error);
    throw error;
  }

  return data as Transaction[];
}
