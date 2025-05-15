
import { supabase } from "@/integrations/supabase/client";
import { TransactionCategory } from "@/types/finance";

export async function getCategories(): Promise<TransactionCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data as TransactionCategory[];
}
