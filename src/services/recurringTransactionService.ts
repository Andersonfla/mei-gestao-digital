import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string | null;
  type: string;
  category: string;
  value: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  next_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringTransactionData {
  description: string;
  type: 'entrada' | 'saida';
  category: string;
  value: number;
  frequency: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  start_date: string;
  end_date?: string;
}

export const recurringTransactionService = {
  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar transações recorrentes:", error);
      toast.error("Erro ao carregar transações recorrentes");
      throw error;
    }
  },

  async createRecurringTransaction(data: CreateRecurringTransactionData): Promise<RecurringTransaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("recurring_transactions")
        .insert({
          user_id: user.id,
          description: data.description,
          type: data.type,
          category: data.category,
          value: data.value,
          frequency: data.frequency,
          start_date: data.start_date,
          end_date: data.end_date || null,
          next_date: data.start_date,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Transação recorrente criada com sucesso!");
      return result;
    } catch (error: any) {
      console.error("Erro ao criar transação recorrente:", error);
      toast.error("Erro ao criar transação recorrente");
      throw error;
    }
  },

  async updateRecurringTransaction(
    id: string,
    updates: Partial<CreateRecurringTransactionData>
  ): Promise<RecurringTransaction> {
    try {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      toast.success("Transação recorrente atualizada!");
      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar transação recorrente:", error);
      toast.error("Erro ao atualizar transação recorrente");
      throw error;
    }
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
      toast.success(active ? "Transação ativada!" : "Transação pausada!");
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da transação");
      throw error;
    }
  },

  async deleteRecurringTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Transação recorrente excluída!");
    } catch (error: any) {
      console.error("Erro ao excluir transação recorrente:", error);
      toast.error("Erro ao excluir transação recorrente");
      throw error;
    }
  },
};

export const frequencyLabels: Record<string, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};
