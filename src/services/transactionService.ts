
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data as Transaction[];
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  // Format Date object to string if needed
  const formattedTransaction = {
    ...transaction,
    date: transaction.date instanceof Date ? format(transaction.date, 'yyyy-MM-dd') : transaction.date,
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(formattedTransaction)
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }

  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

export async function getFilteredTransactions(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*');
  
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
    console.error('Error fetching filtered transactions:', error);
    throw error;
  }

  return data as Transaction[];
}
