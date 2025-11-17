import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category: string | null;
  start_date: string;
  end_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  target_amount: number;
  current_amount?: number;
  category?: string;
  end_date?: string;
}

export interface UpdateGoalData {
  title?: string;
  target_amount?: number;
  current_amount?: number;
  category?: string;
  end_date?: string;
  completed?: boolean;
}

export const financialGoalsService = {
  async getGoals(): Promise<FinancialGoal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar metas:", error);
      toast.error("Erro ao carregar metas financeiras");
      throw error;
    }
  },

  async createGoal(goalData: CreateGoalData): Promise<FinancialGoal> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          user_id: user.id,
          title: goalData.title,
          target_amount: goalData.target_amount,
          current_amount: goalData.current_amount || 0,
          category: goalData.category || null,
          end_date: goalData.end_date || null,
          start_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Meta criada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta financeira");
      throw error;
    }
  },

  async updateGoal(goalId: string, updates: UpdateGoalData): Promise<FinancialGoal> {
    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .update(updates)
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      toast.success("Meta atualizada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar meta:", error);
      toast.error("Erro ao atualizar meta");
      throw error;
    }
  },

  async addAmount(goalId: string, amount: number): Promise<FinancialGoal> {
    try {
      // Buscar meta atual
      const { data: goal, error: fetchError } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("id", goalId)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = goal.current_amount + amount;
      const completed = newAmount >= goal.target_amount;

      const { data, error } = await supabase
        .from("financial_goals")
        .update({ 
          current_amount: newAmount,
          completed 
        })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      toast.success(`R$ ${amount.toFixed(2)} adicionado à meta!`);
      return data;
    } catch (error: any) {
      console.error("Erro ao adicionar valor:", error);
      toast.error("Erro ao adicionar valor à meta");
      throw error;
    }
  },

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      toast.success("Meta excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir meta:", error);
      toast.error("Erro ao excluir meta");
      throw error;
    }
  },
};
