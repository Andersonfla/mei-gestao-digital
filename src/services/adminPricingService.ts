import { supabase } from "@/integrations/supabase/client";
import { calcTotalCost, calcMarginPercent } from "@/lib/pricingCalculations";
import type { PricingProduct } from "@/types/pricing";

export interface AdminPricingStats {
  totalProducts: number;
  activeProducts: number;
  uniqueUsers: number;
  negativeMarginCount: number;
  totalSimulations: number;
}

export interface AdminPricingProductRow extends PricingProduct {
  user_email: string | null;
  total_cost: number;
  margin_percent: number;
}

export const adminPricingService = {
  async getStats(): Promise<AdminPricingStats> {
    const { data: products } = await (supabase as any)
      .from("pricing_products")
      .select("user_id, is_active, ingredient_cost, packaging_cost, operational_cost, platform_fee, delivery_cost, other_costs, sale_price");

    const { count: simCount } = await (supabase as any)
      .from("pricing_simulations")
      .select("*", { count: "exact", head: true });

    const list = (products || []) as PricingProduct[];
    const uniqueUsers = new Set(list.map((p) => p.user_id)).size;
    const activeProducts = list.filter((p) => p.is_active).length;
    const negativeMarginCount = list.filter((p) => {
      const cost = calcTotalCost(p);
      return calcMarginPercent(p.sale_price || 0, cost) < 0 && (p.sale_price || 0) > 0;
    }).length;

    return {
      totalProducts: list.length,
      activeProducts,
      uniqueUsers,
      negativeMarginCount,
      totalSimulations: simCount || 0,
    };
  },

  async getAllProducts(): Promise<AdminPricingProductRow[]> {
    const { data: products, error } = await (supabase as any)
      .from("pricing_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const list = (products || []) as PricingProduct[];

    // Buscar emails dos usuários
    const userIds = Array.from(new Set(list.map((p) => p.user_id)));
    const emailMap = new Map<string, string | null>();

    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      (profiles || []).forEach((u: any) => emailMap.set(u.id, u.email));
    }

    return list.map((p) => {
      const cost = calcTotalCost(p);
      return {
        ...p,
        user_email: emailMap.get(p.user_id) || null,
        total_cost: cost,
        margin_percent: calcMarginPercent(p.sale_price || 0, cost),
      };
    });
  },
};
