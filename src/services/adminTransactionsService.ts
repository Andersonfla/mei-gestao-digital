import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "./adminLogsService";

export type AdminTransaction = {
  id: string;
  user_id: string;
  type: string;
  category: string;
  description: string | null;
  value: number;
  date: string;
  created_at: string;
  user_email?: string;
};

/**
 * Get all transactions with user email
 */
export async function getAllTransactions(): Promise<AdminTransaction[]> {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    // Fetch user emails
    const userIds = [...new Set(transactions?.map(t => t.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

    return (transactions || []).map(t => ({
      ...t,
      user_email: profileMap.get(t.user_id) || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(
  transactionId: string,
  userEmail?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }

    await logAdminAction(
      "Excluiu lançamento",
      null,
      userEmail,
      { transaction_id: transactionId }
    );

    return true;
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return false;
  }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats() {
  try {
    const { data: transactions } = await supabase
      .from("transactions")
      .select("value, type");

    const totalTransactions = transactions?.length || 0;
    const totalIncome = transactions
      ?.filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + Number(t.value), 0) || 0;
    const totalExpense = transactions
      ?.filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.value), 0) || 0;

    return {
      totalTransactions,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  } catch (error) {
    console.error("Failed to fetch transaction stats:", error);
    return {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };
  }
}
