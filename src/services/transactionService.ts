
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";

/**
 * Buscar todas as transações do usuário autenticado.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para getTransactions");
    throw new Error("Autenticação necessária");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.session.user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar transações:", error);
    throw error;
  }

  return data as Transaction[];
}

/**
 * Buscar transações do usuário autenticado dentro de um período específico
 */
export async function getFilteredTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para getFilteredTransactions");
    throw new Error("Autenticação necessária");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.session.user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar transações filtradas:", error);
    throw error;
  }

  return data as Transaction[];
}

/**
 * Adicionar nova transação para o usuário autenticado.
 */
export async function addTransaction(
  transaction: Omit<Transaction, "id" | "created_at">
): Promise<Transaction> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para addTransaction");
    throw new Error("Você precisa estar logado para adicionar transações");
  }

  const formattedTransaction = {
    ...transaction,
    user_id: session.session.user.id,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([formattedTransaction])
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar transação:", error);
    throw error;
  }

  return data as Transaction;
}

/**
 * Excluir uma transação por ID.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir transação:", error);
    throw error;
  }
}
