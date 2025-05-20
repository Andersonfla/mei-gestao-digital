
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

  return data as unknown as Transaction[];
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

  return data as unknown as Transaction[];
}

/**
 * Adicionar nova transação para o usuário autenticado.
 */
export async function addTransaction(
  transaction: Omit<Transaction, "id" | "created_at" | "user_id">
): Promise<Transaction> {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para addTransaction");
    throw new Error("Você precisa estar logado para adicionar transações");
  }

  // Formatar a data
  const formattedDate = transaction.date instanceof Date
    ? format(transaction.date, 'yyyy-MM-dd')
    : transaction.date;

  const monthKey = formattedDate.slice(0, 7); // "YYYY-MM"

  // ⚠️ Verificar se já existe uma transação de tipo "limite" para esse mês
  const { data: existingLimit, error: limitError } = await supabase
    .from("transactions")
    .select("*")
    .eq("type", "limite")
    .eq("user_id", session.session.user.id) // Importante garantir que estamos filtrando pelo usuário atual
    .gte("date", `${monthKey}-01`)
    .lte("date", `${monthKey}-31`);

  if (limitError) {
    console.error("Erro ao verificar limite do mês:", limitError);
  }

  // ⚠️ Inserir automaticamente o limite caso não exista
  if (!existingLimit || existingLimit.length === 0) {
    await supabase.from("transactions").insert({
      type: "limite",
      description: "Limite mensal de transações",
      value: 20, // ou outro valor do seu plano
      date: `${monthKey}-01`,
      category: "limite",
      user_id: session.session.user.id // Adicionando o user_id explicitamente
    });
  }

  // Inserir a transação principal com o user_id explícito
  const formattedTransaction = {
    type: transaction.type,
    category: transaction.category,
    description: transaction.description || "",
    value: transaction.value,
    date: formattedDate,
    user_id: session.session.user.id // Adicionando o user_id explicitamente
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert(formattedTransaction)
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar transação:", error);
    throw error;
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
  
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", session.session.user.id);

  if (error) {
    console.error("Erro ao excluir transação:", error);
    throw error;
  }
}
