import { supabase } from "@/integrations/supabase/client";
import type { PricingSimulation } from "@/types/pricing";

export const pricingSimulationService = {
  async getSimulations(): Promise<PricingSimulation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await (supabase as any)
      .from("pricing_simulations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as PricingSimulation[];
  },

  async saveSimulation(simulation: Omit<PricingSimulation, 'id' | 'user_id' | 'created_at'>): Promise<PricingSimulation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await (supabase as any)
      .from("pricing_simulations")
      .insert({ ...simulation, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as PricingSimulation;
  },

  async deleteSimulation(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("pricing_simulations")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
