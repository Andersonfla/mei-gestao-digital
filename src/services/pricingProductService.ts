import { supabase } from "@/integrations/supabase/client";
import type { PricingProduct, PricingProductFormData, PricingProductHistory } from "@/types/pricing";

export const pricingProductService = {
  async getProducts(): Promise<PricingProduct[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await (supabase as any)
      .from("pricing_products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as PricingProduct[];
  },

  async createProduct(product: PricingProductFormData): Promise<PricingProduct> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await (supabase as any)
      .from("pricing_products")
      .insert({ ...product, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as PricingProduct;
  },

  async updateProduct(id: string, product: Partial<PricingProductFormData>): Promise<PricingProduct> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    // Get old product for history
    const { data: oldProduct } = await (supabase as any)
      .from("pricing_products")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await (supabase as any)
      .from("pricing_products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Record history if price changed
    if (oldProduct && data) {
      const oldTotal = (oldProduct.ingredient_cost || 0) + (oldProduct.packaging_cost || 0) +
        (oldProduct.operational_cost || 0) + (oldProduct.platform_fee || 0) +
        (oldProduct.delivery_cost || 0) + (oldProduct.other_costs || 0);
      const newTotal = (data.ingredient_cost || 0) + (data.packaging_cost || 0) +
        (data.operational_cost || 0) + (data.platform_fee || 0) +
        (data.delivery_cost || 0) + (data.other_costs || 0);

      if (oldProduct.sale_price !== data.sale_price || oldTotal !== newTotal) {
        await (supabase as any).from("pricing_product_history").insert({
          product_id: id,
          user_id: user.id,
          old_sale_price: oldProduct.sale_price,
          new_sale_price: data.sale_price,
          old_total_cost: oldTotal,
          new_total_cost: newTotal,
          change_type: oldProduct.sale_price !== data.sale_price ? "price_change" : "cost_change",
        });
      }
    }

    return data as PricingProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("pricing_products")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async toggleProductActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await (supabase as any)
      .from("pricing_products")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw error;
  },

  async getProductHistory(productId: string): Promise<PricingProductHistory[]> {
    const { data, error } = await (supabase as any)
      .from("pricing_product_history")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as PricingProductHistory[];
  },
};
