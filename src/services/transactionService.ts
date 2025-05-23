
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

  const userId = session.session.user.id;
  console.log("Buscando transações para o usuário:", userId);

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
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

  const userId = session.session.user.id;
  console.log(`Buscando transações filtradas para o usuário ${userId} entre ${startDate} e ${endDate}`);

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
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
 * Verificar se o usuário pode adicionar mais transações (limites do plano)
 */
async function canAddTransaction(): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }
  
  const userId = session.session.user.id;
  
  // Buscar perfil do usuário
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
    
  if (profileError) {
    console.error("Erro ao verificar plano do usuário:", profileError);
    return false;
  }
  
  // Usuários premium não têm limite
  if (profileData.plan === "premium") {
    return true;
  }
  
  // Para usuários do plano gratuito, verificar o limite mensal
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Contar diretamente as transações do usuário no mês atual
  const { count: transactionCount, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lte("date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);
    
  if (countError) {
    console.error("Erro ao contar transações:", countError);
    return false;
  }
  
  const count = transactionCount || 0;
  console.log(`Verificando limites: contagem atual = ${count} de 20 permitidas`);
  
  // Verificar se ultrapassou o limite de 20 transações
  return count < 20;
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

  const userId = session.session.user.id;
  console.log("Adicionando transação para o usuário:", userId);
  
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
    user_id: userId  // Garantir que o user_id seja sempre preenchido
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

  console.log("Transação adicionada com sucesso para o usuário:", userId);
  return data as unknown as Transaction;
}

/**
 * Excluir uma transação por ID.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para deleteTransaction");
    throw new Error("Autenticação necessária");
  }
  
  const userId = session.session.user.id;
  console.log(`Tentando excluir transação ${id} para o usuário ${userId}`);
  
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);  // Garantir que apenas as transações do usuário sejam excluídas

  if (error) {
    console.error(`Erro ao excluir transação ${id}:`, error);
    throw error;
  }

  console.log(`Transação ${id} excluída com sucesso para o usuário ${userId}`);
}
